// Simplified mock handlers - just household for now
import { householdMock } from "./household-mock.js";

class MockHandlers {
  constructor() {
    this.handlers = new Map();
    this.registerHandlers();
  }

  registerHandlers() {
    // Only household endpoints for now
    this.handlers.set("GET /api/households", householdMock.getHouseholds);
    this.handlers.set("POST /api/households", householdMock.createHousehold);
    this.handlers.set("GET /api/households/:id", householdMock.getHousehold);
    this.handlers.set("PUT /api/households/:id", householdMock.updateHousehold);
    this.handlers.set("DELETE /api/households/:id", householdMock.deleteHousehold);
    this.handlers.set("GET /api/households/:id/members", householdMock.getMembers);
    this.handlers.set("POST /api/households/:id/invite", householdMock.createInvite);
    this.handlers.set("DELETE /api/households/:id/members/:userId", householdMock.removeMember);
    this.handlers.set("POST /api/households/:id/leave", householdMock.leaveHousehold);
    this.handlers.set("GET /api/households/:id/dashboard", householdMock.getDashboard);
  }

  // Match URL patterns
  matchRoute(method, url) {
    const key = `${method} ${url}`;

    // Try exact match first
    if (this.handlers.has(key)) {
      return { handler: this.handlers.get(key), params: {} };
    }

    // Try pattern matching
    for (const [pattern, handler] of this.handlers.entries()) {
      const params = this.extractParams(pattern, key);
      if (params) {
        return { handler, params };
      }
    }

    return null;
  }

  // Extract URL parameters
  extractParams(pattern, key) {
    const patternParts = pattern.split(" ")[1].split("/");
    const keyParts = key.split(" ")[1].split("/");

    if (patternParts.length !== keyParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(":")) {
        const paramName = patternParts[i].slice(1);
        params[paramName] = keyParts[i];
      } else if (patternParts[i] !== keyParts[i]) {
        return null;
      }
    }

    return params;
  }

  // Handle incoming requests
  async handle({ method, url, data, params: queryParams }) {
    console.log(`🎭 MOCK HANDLER: ${method} ${url}`, { data, queryParams });
    
    const match = this.matchRoute(method, url);

    if (!match) {
      console.error(`❌ No handler found for: ${method} ${url}`);
      throw {
        code: "NOT_FOUND",
        message: `Endpoint ${method} ${url} not found`,
        status: 404,
      };
    }

    try {
      console.log(`✅ Found handler for: ${method} ${url}`, match.params);
      const result = await match.handler({
        params: match.params,
        data,
        query: queryParams,
      });
      console.log(`✅ Handler result:`, result);
      return result;
    } catch (error) {
      console.error("❌ Mock handler error:", error);
      throw {
        code: "MOCK_ERROR",
        message: error.message || "Mock handler error",
        status: 500,
      };
    }
  }
}

export const mockHandlers = new MockHandlers();
console.log("✅ Mock handlers initialized");