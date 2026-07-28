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
