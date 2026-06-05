const DEFAULT_API_URL = "http://localhost:8000";

export function getApiUrl() {
  if (typeof window !== "undefined") {
    // Read from environment if possible, else default
    return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  }
  return DEFAULT_API_URL;
}

export function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("promptarmor_token");
  }
  return null;
}

export function setAuthToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("promptarmor_token", token);
    } else {
      localStorage.removeItem("promptarmor_token");
    }
  }
}

export function clearSession() {
  setAuthToken(null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("promptarmor_user_email");
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${getApiUrl()}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }
    let errMsg = "API Request failed";
    try {
      const errJson = await response.json();
      errMsg = errJson.detail || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
