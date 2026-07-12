import { act } from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";

type QueryResult<T = unknown> = { data: T; error: null };

class SupabaseQueryBuilder<T = unknown> implements PromiseLike<QueryResult<T>> {
  private result: QueryResult<T>;

  constructor(result: QueryResult<T>) {
    this.result = result;
  }

  select() {
    return this;
  }

  insert() {
    return this;
  }

  update() {
    return this;
  }

  delete() {
    return this;
  }

  upsert() {
    return this;
  }

  eq() {
    return this;
  }

  neq() {
    return this;
  }

  in() {
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  single() {
    return this;
  }

  maybeSingle() {
    return this;
  }

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

const createQuery = <T,>(data: T) => new SupabaseQueryBuilder<T>({ data, error: null });

vi.mock("@/integrations/supabase/client", () => {
  const emptyList = [] as unknown[];

  return {
    supabase: {
      from: () => createQuery(emptyList),
      rpc: () => Promise.resolve({ data: false, error: null }),
      functions: {
        invoke: () => Promise.resolve({ data: null, error: null }),
      },
      storage: {
        from: () => ({
          list: () => Promise.resolve({ data: [], error: null }),
          upload: () => Promise.resolve({ data: null, error: null }),
          remove: () => Promise.resolve({ data: null, error: null }),
          getPublicUrl: (path: string) => ({
            data: { publicUrl: `https://example.com/${path}` },
          }),
        }),
      },
      auth: {
        onAuthStateChange: (callback: (event: string, session: null) => void) => {
          callback("INITIAL_SESSION", null);

          return {
            data: {
              subscription: {
                unsubscribe: vi.fn(),
              },
            },
          };
        },
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
    },
  };
});

const PUBLIC_ROUTES = [
  "/",
  "/product",
  "/industries",
  "/integrations",
  "/pricing",
  "/contact",
  "/features",
  "/blog",
  "/ar",
  "/ar/product",
  "/ar/industries",
  "/ar/pricing",
  "/ar/contact",
] as const;

const flushRender = async () => {
  await waitFor(() => {
    expect(document.body.textContent?.trim().length ?? 0).toBeGreaterThan(0);
  });

  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
};

const isIgnorableConsoleMessage = (message: string) => {
  return (
    message.includes("not wrapped in act(...)") ||
    message.includes("React Router Future Flag Warning")
  );
};

describe("public page console regression guard", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("ipapi.co") || url.includes("ip2c.org")) {
        return {
          ok: false,
          json: async () => ({}),
          text: async () => "",
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({}),
        text: async () => "",
      } as Response;
    }) as typeof fetch;

    Object.defineProperty(window, "scrollTo", {
      writable: true,
      value: vi.fn(),
    });

    class IntersectionObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
      root = null;
      rootMargin = "0px";
      thresholds = [0];
    }

    class ResizeObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      value: IntersectionObserverMock,
    });

    Object.defineProperty(window, "ResizeObserver", {
      writable: true,
      value: ResizeObserverMock,
    });
  });

  beforeEach(() => {
    localStorage.clear();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    cleanup();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it.each(PUBLIC_ROUTES)("renders %s without console warnings or errors", async (route) => {
    window.history.pushState({}, "", route);

    await act(async () => {
      render(<App />);
    });
    await flushRender();

    const errorMessages = errorSpy.mock.calls
      .map((call) => call.join(" "))
      .filter((message) => !isIgnorableConsoleMessage(message));
    const warnMessages = warnSpy.mock.calls
      .map((call) => call.join(" "))
      .filter((message) => !isIgnorableConsoleMessage(message));

    expect(
      { errors: errorMessages, warnings: warnMessages },
      `Console warnings/errors detected while rendering route ${route}`,
    ).toEqual({ errors: [], warnings: [] });
  });
});