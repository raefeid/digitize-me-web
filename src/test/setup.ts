import "@testing-library/jest-dom";
import { vi } from "vitest";

// jsdom has no canvas implementation; lottie-web touches a 2d context at import time.
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() =>
    new Proxy(
      {},
      {
        get: () => () => undefined,
        set: () => true,
      },
    )) as unknown as HTMLCanvasElement["getContext"];
}

vi.mock("lottie-react", () => ({
  __esModule: true,
  default: () => null,
}));

// jsdom does not implement HTMLMediaElement playback; calling play() logs a
// "Not implemented" error to the console. Stub it so video components render
// cleanly in tests.
if (typeof HTMLMediaElement !== "undefined") {
  HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
  HTMLMediaElement.prototype.pause = vi.fn();
}


Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
