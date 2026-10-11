import { describe, expect, it } from "vitest";
import { listenLabel } from "./listenStatus";

describe("listening labels", () => {
  it("names each listening pill state", () => {
    expect(listenLabel({ status: "off" })).toBe("Off");
    expect(listenLabel({ status: "starting" })).toBe("Starting…");
    expect(listenLabel({ status: "calibrating" })).toBe("Calibrating…");
    expect(listenLabel({ status: "listening" })).toBe("Listening");
    expect(listenLabel({ status: "connected", detail: "Practice Piano" })).toBe("Connected · Practice Piano");
    expect(listenLabel({ status: "detected", detail: "C4" })).toBe("Heard C4");
    expect(listenLabel({ status: "error", detail: "Permission needed" })).toBe("Permission needed");
  });
});
