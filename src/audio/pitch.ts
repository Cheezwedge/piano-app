import { PitchDetector } from "pitchy";
import { freqToMidi, isConfidentPitch } from "./notes";

export interface PitchHit {
  midi: number;
  frequency: number;
  clarity: number;
}

interface WatchOptions {
  calibrationCents: number;
  onNote: (hit: PitchHit) => void;
}

export async function startMicWatch(options: WatchOptions): Promise<() => void> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });

  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0;
  source.connect(analyser);

  const detector = PitchDetector.forFloat32Array(analyser.fftSize);
  const input = new Float32Array(detector.inputLength);

  let lastMidi: number | null = null;
  let stableCount = 0;
  let armed = true;
  let raf = 0;
  let stopped = false;

  const tick = () => {
    if (stopped) return;
    analyser.getFloatTimeDomainData(input);
    const [frequency, clarity] = detector.findPitch(input, ctx.sampleRate);

    if (frequency && clarity > 0.8) {
      const midi = freqToMidi(frequency, options.calibrationCents);
      if (isConfidentPitch(frequency, clarity, midi, options.calibrationCents)) {
        if (midi === lastMidi) {
          stableCount += 1;
        } else {
          lastMidi = midi;
          stableCount = 1;
          armed = true;
        }
        if (armed && stableCount >= 3) {
          armed = false;
          options.onNote({ midi, frequency, clarity });
        }
      }
    } else {
      lastMidi = null;
      stableCount = 0;
      armed = true;
    }

    raf = window.setTimeout(tick, 40);
  };

  tick();

  return () => {
    stopped = true;
    window.clearTimeout(raf);
    source.disconnect();
    void ctx.close();
    stream.getTracks().forEach((track) => track.stop());
  };
}

export async function measureMiddleC(ms = 1800): Promise<number | null> {
  const best: PitchHit[] = [];
  const stop = await startMicWatch({
    calibrationCents: 0,
    onNote: (hit) => {
      if (!best[0] || hit.clarity > best[0].clarity) best[0] = hit;
    },
  });

  await new Promise((resolve) => window.setTimeout(resolve, ms));
  stop();
  const hit = best[0];
  if (!hit) return null;

  const expected = 261.6255653005986;
  return 1200 * Math.log2(hit.frequency / expected);
}
