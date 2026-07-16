const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.m.p3hm.my.id";

export interface ApiResponse<T = unknown> {
  status: string;
  message?: string;
  data: T;
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Crucial for session cookies
  };

  const response = await fetch(url, config);
  
  if (response.status === 401) {
    // Don't force redirect here — let the calling component handle it.
    // The dashboard layout and useAuth handle unauthenticated state gracefully.
    throw new Error("Unauthorized");
  }

  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(json.message || "Request failed");
  }

  return json;
}
