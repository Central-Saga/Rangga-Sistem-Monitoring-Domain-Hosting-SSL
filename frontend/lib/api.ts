const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers }).catch(() => {
    throw new ApiError(0, "Tidak dapat terhubung ke server. Periksa koneksi Anda dan coba lagi.");
  });

  await checkResponse(res);

  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

async function checkResponse(res: Response): Promise<void> {
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Sesi berakhir, silakan login kembali.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, typeof body.message === "string" ? body.message : `Error ${res.status}`, body.errors);
  }
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function firstMessages(errors?: Record<string, string[]>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(errors ?? {}).map(([field, messages]) => [field, messages[0] ?? ""])
  );
}

export async function downloadPdf(path: string, filename: string): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: "application/pdf, application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).catch(() => {
    throw new ApiError(0, "Tidak dapat terhubung ke server. Periksa koneksi Anda dan coba lagi.");
  });
  await checkResponse(res);

  const blob = await res.blob();
  if (!res.headers.get("content-type")?.toLowerCase().includes("application/pdf") ||
      await blob.slice(0, 5).text() !== "%PDF-") {
    throw new ApiError(res.status, "Server tidak mengirim berkas PDF yang valid. Silakan coba lagi.");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
