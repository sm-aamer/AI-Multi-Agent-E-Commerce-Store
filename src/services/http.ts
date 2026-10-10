// Real HTTP client for the FastAPI backend. Used when VITE_USE_MOCK_API === "false".
export const API_BASE_URL = import.meta.env["VITE_API_BASE_URL"] ?? "http://localhost:8000/api/v1";
export const USE_MOCK = import.meta.env["VITE_USE_MOCK_API"] !== "false";

const TOKEN_KEY = "trendora.token";
export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string | null) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)),
};

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? res.statusText);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const qs = (o: Record<string, unknown>) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => v !== undefined && v !== "" && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : "";
};
