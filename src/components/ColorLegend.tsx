import { FEEDBACK_COLORS } from "../types";

export function ColorLegend() {
  return (
    <ul className="legend" data-testid="color-legend">
      {Object.entries(FEEDBACK_COLORS).map(([key, value]) => (
        <li key={key}>
          <span className="swatch" style={{ background: value.hex }} />
          <div>
            <strong>{value.label}</strong>
            <p>{value.meaning}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
