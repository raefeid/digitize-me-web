import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "@/components/ErrorBoundary";

const Bomb = ({ error }: { error: Error }) => {
  throw error;
};

describe("ErrorBoundary", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // React logs caught errors to console.error — silence for clean output.
    consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    sessionStorage.clear();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>all good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("all good")).toBeInTheDocument();
  });

  it("shows the recovery UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <Bomb error={new Error("boom")} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/Reload/)).toBeInTheDocument();
  });

  it("auto-reloads once on a chunk-load error", () => {
    const reload = vi.fn();
    const original = window.location;
    Object.defineProperty(window, "location", {
      value: { ...original, reload },
      writable: true,
    });

    const chunkError = new Error("Failed to fetch dynamically imported module: /assets/x.js");
    render(
      <ErrorBoundary>
        <Bomb error={chunkError} />
      </ErrorBoundary>,
    );

    expect(reload).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("dm-chunk-reload-attempted")).toBe("1");

    Object.defineProperty(window, "location", { value: original, writable: true });
  });

  it("does not reload a second time (avoids reload loop)", () => {
    sessionStorage.setItem("dm-chunk-reload-attempted", "1");
    const reload = vi.fn();
    const original = window.location;
    Object.defineProperty(window, "location", {
      value: { ...original, reload },
      writable: true,
    });

    render(
      <ErrorBoundary>
        <Bomb error={new Error("ChunkLoadError: Loading chunk 5 failed")} />
      </ErrorBoundary>,
    );

    expect(reload).not.toHaveBeenCalled();
    // Falls through to the recovery UI instead.
    expect(screen.getByText("A new version is available")).toBeInTheDocument();

    Object.defineProperty(window, "location", { value: original, writable: true });
  });
});
