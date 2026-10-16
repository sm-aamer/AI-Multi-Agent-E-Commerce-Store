// Real HTTP client for the FastAPI backend. Used when VITE_USE_MOCK_API === "false".
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:8000/api/v1";
export const USE_MOCK = import.meta.env["VITE_USE_MOCK_API"] !== "false";

const TOKEN_KEY = "velloria.token";
export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string | null) =>
    t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const parseJsonBody = async <T>(res: Response): Promise<T | null> => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
};

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const body = await parseJsonBody<T>(res);

  if (!res.ok) {
    const detail =
      typeof body === "object" && body !== null && "detail" in body
        ? ((body as { detail?: string }).detail ?? res.statusText)
        : typeof body === "string" && body.length > 0
          ? body
          : res.statusText;
    throw new ApiError(res.status, detail || "Request failed");
  }

  if (res.status === 204 || body === null) return undefined as T;
  return body as T;
}

export const qs = (o: Record<string, unknown>) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v !== undefined && v !== "" && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : "";
};
