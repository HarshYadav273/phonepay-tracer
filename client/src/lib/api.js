const configuredApiBaseUrl = import.meta.env?.VITE_API_BASE_URL?.trim() || "";

function getDefaultApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  return `${window.location.protocol}//${window.location.hostname}:5000`;
}

export const API_BASE_URL = configuredApiBaseUrl || getDefaultApiBaseUrl();

export function getApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
