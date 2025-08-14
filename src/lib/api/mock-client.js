import API_CONFIG from "../config/api.js";

class MockClient {
  constructor() {
    this.delay = API_CONFIG.MOCK.DELAY;
    this.errorRate = API_CONFIG.MOCK.ERROR_RATE;
    this.enableLogging = API_CONFIG.MOCK.ENABLE_LOGGING;
  }

  // Simulate network delay
  async simulateDelay() {
    const delay = this.delay + Math.random() * 200; // Add some variance
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Simulate random errors
  simulateError() {
    if (Math.random() < this.errorRate) {
      const errors = [
        {
          response: {
            status: 500,
            data: { error: { code: "NETWORK_ERROR", message: "Network timeout" } },
          },
        },
        {
          response: {
            status: 500,
            data: { error: { code: "SERVER_ERROR", message: "Internal server error" } },
          },
        },
        {
          response: {
            status: 429,
            data: { error: { code: "RATE_LIMIT", message: "Too many requests" } },
          },
        },
      ];

      const errorData = errors[Math.floor(Math.random() * errors.length)];
      const error = new Error(errorData.response.data.error.message);
      error.response = errorData.response;
      error.isAxiosError = true;
      throw error;
    }
  }

  // Log mock requests
  log(method, url, data = null) {
    if (this.enableLogging) {
      console.log(`🎭 MOCK ${method} ${url}`, data);
    }
  }

  // Main request method
  async request({ method = "GET", url, data, params }) {
    this.log(method, url, data);

    await this.simulateDelay();
    this.simulateError();

    try {
      // Route to appropriate mock handler
      const { mockHandlers } = await import("./mock-handlers/index.js");

      const response = await mockHandlers.handle({
        method: method.toUpperCase(),
        url,
        data,
        params,
      });

      // Return in axios-compatible format
      return {
        data: response,
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        config: { method, url, data, params },
      };
    } catch (error) {
      // Format mock handler errors to match axios structure
      if (error.code && error.status && !error.response) {
        const axiosError = new Error(error.message);
        axiosError.response = {
          status: error.status,
          data: {
            error: {
              code: error.code,
              message: error.message,
            },
          },
        };
        axiosError.isAxiosError = true;
        throw axiosError;
      }
      throw error;
    }
  }
  // Convenience methods
  get(url, config = {}) {
    return this.request({ ...config, method: "GET", url });
  }

  post(url, data, config = {}) {
    return this.request({ ...config, method: "POST", url, data });
  }

  put(url, data, config = {}) {
    return this.request({ ...config, method: "PUT", url, data });
  }

  delete(url, config = {}) {
    return this.request({ ...config, method: "DELETE", url });
  }
}

export default new MockClient();
