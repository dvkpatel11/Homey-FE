import API_CONFIG from "../config/api.js";

// Production API client using fetch
export const prodApiCall = async (method, endpoint, options = {}) => {
  const { data, headers = {}, ...fetchOptions } = options;

  // Get auth token from localStorage or auth context
  const token = localStorage.getItem("auth_token");
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    ...fetchOptions,
  };

  if (data && (method === "POST" || method === "PUT")) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_CONFIG.PROD.BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: "Network error" },
    }));
    throw new Error(error.error?.message || "API request failed");
  }

  return response.json();
};
