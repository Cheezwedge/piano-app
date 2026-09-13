import { useEffect, useState } from "react";
import { formatLockRemaining, isValidPin, type PinResult } from "../lib/pin";
import { useApp } from "../store/AppState";

interface Props {
  title: string;
  subtitle?: string;
  onSubmit: (pin: string) => Promise<PinResult> | PinResult;
  onCancel?: () => void;
  submitLabel?: string;
}

export function PinPad({ title, subtitle, onSubmit, onCancel, submitLabel = "Unlock" }: Props) {
  const { persist } = useApp();
  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const locked = persist.pinLockedUntil > now;
  const expected = persist.pinLength || 0;
  const maxLen = expected || 6;
  const slots = expected || Math.max(4, digits.length);
  const sentRef = useState(() => ({ current: "" }))[0];

  useEffect(() => {
    if (!locked) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [locked]);

  useEffect(() => {
    if (locked) {
      setError(`Too many tries. Wait ${formatLockRemaining(persist.pinLockedUntil, now)}.`);
    }
  }, [locked, persist.pinLockedUntil, now]);

  const press = (value: string) => {
    if (locked) return;
    setError("");
    if (value === "clear") {
      setDigits("");
      return;
    }
    if (value === "del") {
      setDigits((prev) => prev.slice(0, -1));
      return;
    }
    setDigits((prev) => {
      if (prev.length >= maxLen) return prev;
      return prev + value;
    });
  };

  const submit = async (value = digits) => {
    if (locked || busy) return;
    if (sentRef.current === value) return;
    if (expected && value.length !== expected) {
      setError(`Enter the ${expected}-digit PIN.`);
      return;
    }
    if (!isValidPin(value)) {
      setError("Enter 4 to 6 digits.");
      return;
    }
    sentRef.current = value;
    setBusy(true);
    const result = await onSubmit(value);
    setBusy(false);
    if (!result.ok) {
      sentRef.current = "";
      setError(result.message);
      setDigits("");
    }
  };

  useEffect(() => {
    if (expected && digits.length === expected && !busy && !locked) {
      void submit(digits);
    }
    // Auto-submit once the stored length is reached.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, expected]);

  return (
    <div className="pin-overlay" data-testid="pin-gate">
      <div className="pin-card">
        <h2>{title}</h2>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
        <div className="pin-dots" aria-label="PIN progress">
          {Array.from({ length: slots }, (_, index) => (
            <span key={index} className={digits.length > index ? "filled" : ""} />
          ))}
        </div>
        <div className="pin-grid">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "del"].map((key) => (
            <button
              key={key}
              type="button"
              className="pin-key"
              data-testid={`pin-key-${key}`}
              disabled={locked}
              onClick={() => press(key)}
            >
              {key === "clear" ? "Clear" : key === "del" ? "⌫" : key}
            </button>
          ))}
        </div>
        {error ? (
          <p className="error-text" data-testid="pin-error">
            {error}
          </p>
        ) : null}
        <div className="row-actions">
          {onCancel ? (
            <button type="button" className="btn ghost" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          <button
            type="button"
            className="btn primary"
            data-testid="pin-submit"
            disabled={busy || locked}
            onClick={() => void submit()}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
