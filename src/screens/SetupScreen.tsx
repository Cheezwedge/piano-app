import { useState } from "react";
import { AVATARS } from "../types";
import { isValidPin } from "../lib/pin";
import { useApp } from "../store/AppState";

export function SetupPinScreen() {
  const { setPin, setScreen } = useApp();
  const [pin, setPinValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const save = async () => {
    if (!isValidPin(pin)) {
      setError("Choose a 4-digit PIN.");
      return;
    }
    if (pin !== confirm) {
      setError("Those PINs do not match.");
      return;
    }
    await setPin(pin);
    setScreen("setup-kid");
  };

  return (
    <main className="page narrow" data-testid="setup-pin-screen">
      <h1>Parent PIN</h1>
      <p className="muted">
        Kids will need this for settings, switching profiles, or leaving a lesson early. After five
        wrong tries the pad pauses.
      </p>
      <label>
        New PIN
        <input
          data-testid="pin-input"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(event) => setPinValue(event.target.value.replace(/\D/g, "").slice(0, 4))}
        />
      </label>
      <label>
        Type it again
        <input
          data-testid="pin-confirm"
          inputMode="numeric"
          maxLength={4}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value.replace(/\D/g, "").slice(0, 4))}
        />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button type="button" className="btn primary" data-testid="save-pin" onClick={() => void save()}>
        Save PIN
      </button>
    </main>
  );
}

export function SetupKidScreen({ nextScreen = "home" }: { nextScreen?: "home" | "settings" }) {
  const { addKid, setScreen } = useApp();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string>(AVATARS[0]);
  const [error, setError] = useState("");

  const save = () => {
    if (!name.trim()) {
      setError("Add a first name.");
      return;
    }
    addKid(name, avatar);
    setScreen(nextScreen);
  };

  return (
    <main className="page narrow" data-testid="setup-kid-screen">
      <h1>Kid profile</h1>
      <p className="muted">Home Keys can keep a few profiles on this device.</p>
      <label>
        Name
        <input
          data-testid="kid-name"
          value={name}
          maxLength={18}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <div className="avatar-row">
        {AVATARS.map((item) => (
          <button
            key={item}
            type="button"
            className={item === avatar ? "avatar selected" : "avatar"}
            onClick={() => setAvatar(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <button type="button" className="btn primary" data-testid="save-kid" onClick={save}>
        Save profile
      </button>
    </main>
  );
}
