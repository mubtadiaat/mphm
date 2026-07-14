const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export interface ApiResponse<T = any> {
  status: string;
  message?: string;
  data: T;
}

export async function apiRequest<T = any>(
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
    // Session expired or invalid -> Redirect to login page on client
    if (typeof window !== "undefined") {
      document.cookie = "session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      window.location.href = "/";
    }
    throw new Error("Unauthorized");
  }

  const json = await response.json();
  
  if (!response.ok) {
    throw new Error(json.message || "Request failed");
  }

  return json;
}
