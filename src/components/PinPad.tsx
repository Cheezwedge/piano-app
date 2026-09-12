import { useState } from "react";

interface Props {
  title: string;
  subtitle?: string;
  onSubmit: (pin: string) => Promise<boolean> | boolean;
  onCancel?: () => void;
  submitLabel?: string;
}

export function PinPad({ title, subtitle, onSubmit, onCancel, submitLabel = "Unlock" }: Props) {
  const [digits, setDigits] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const press = (value: string) => {
    setError("");
    if (value === "clear") {
      setDigits("");
      return;
    }
    if (value === "del") {
      setDigits((prev) => prev.slice(0, -1));
      return;
    }
    setDigits((prev) => (prev.length >= 4 ? prev : prev + value));
  };

  const submit = async () => {
    if (digits.length !== 4) {
      setError("Enter 4 digits.");
      return;
    }
    setBusy(true);
    const ok = await onSubmit(digits);
    setBusy(false);
    if (!ok) {
      setError("That PIN does not match.");
      setDigits("");
    }
  };

  return (
    <div className="pin-overlay" data-testid="pin-gate">
      <div className="pin-card">
        <h2>{title}</h2>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
        <div className="pin-dots" aria-label="PIN progress">
          {[0, 1, 2, 3].map((index) => (
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
              onClick={() => press(key)}
            >
              {key === "clear" ? "Clear" : key === "del" ? "⌫" : key}
            </button>
          ))}
        </div>
        {error ? <p className="error-text">{error}</p> : null}
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
            disabled={busy}
            onClick={() => void submit()}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
