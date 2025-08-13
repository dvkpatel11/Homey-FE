import authMock from './auth-mock.js';
import householdMock from './household-mock.js';
import taskMock from './task-mock.js';
import expenseMock from './expense-mock.js';
import chatMock from './chat-mock.js';
import notificationMock from './notification-mock.js';

class MockHandlers {
  constructor() {
    this.handlers = new Map();
    this.registerHandlers();
  }

  registerHandlers() {
    // Auth endpoints
    this.handlers.set('GET /api/profile', authMock.getProfile);
    this.handlers.set('PUT /api/profile', authMock.updateProfile);
    this.handlers.set('POST /api/invite/validate', authMock.validateInvite);
    this.handlers.set('POST /api/invite/join', authMock.joinHousehold);

    // Household endpoints
    this.handlers.set('GET /api/households', householdMock.getHouseholds);
    this.handlers.set('POST /api/households', householdMock.createHousehold);
    this.handlers.set('GET /api/households/:id', householdMock.getHousehold);
    this.handlers.set('PUT /api/households/:id', householdMock.updateHousehold);
    this.handlers.set('DELETE /api/households/:id', householdMock.deleteHousehold);
    this.handlers.set('GET /api/households/:id/members', householdMock.getMembers);
    this.handlers.set('POST /api/households/:id/invite', householdMock.createInvite);
    this.handlers.set('DELETE /api/households/:id/members/:userId', householdMock.removeMember);
    this.handlers.set('POST /api/households/:id/leave', householdMock.leaveHousehold);
    this.handlers.set('GET /api/households/:id/dashboard', householdMock.getDashboard);

    // Task endpoints
    this.handlers.set('GET /api/households/:id/tasks', taskMock.getTasks);
    this.handlers.set('POST /api/households/:id/tasks', taskMock.createTask);
    this.handlers.set('GET /api/tasks/:id', taskMock.getTask);
    this.handlers.set('PUT /api/tasks/:id', taskMock.updateTask);
    this.handlers.set('DELETE /api/tasks/:id', taskMock.deleteTask);
    this.handlers.set('POST /api/tasks/:id/assign', taskMock.assignTask);
    this.handlers.set('PUT /api/tasks/:id/complete', taskMock.completeTask);
    this.handlers.set('PUT /api/tasks/:id/uncomplete', taskMock.uncompleteTask);
    this.handlers.set('POST /api/tasks/:id/swap/request', taskMock.requestSwap);
    this.handlers.set('PUT /api/task-swaps/:id/accept', taskMock.acceptSwap);
    this.handlers.set('PUT /api/task-swaps/:id/decline', taskMock.declineSwap);
    this.handlers.set('GET /api/households/:id/task-swaps', taskMock.getSwaps);

    // Bill endpoints
    this.handlers.set('GET /api/households/:id/bills', expenseMock.getBills);
    this.handlers.set('POST /api/households/:id/bills', expenseMock.createBill);
    this.handlers.set('GET /api/bills/:id', expenseMock.getBill);
    this.handlers.set('PUT /api/bills/:id', expenseMock.updateBill);
    this.handlers.set('DELETE /api/bills/:id', expenseMock.deleteBill);
    this.handlers.set('PUT /api/bills/:id/split', expenseMock.updateSplit);
    this.handlers.set('POST /api/bills/:id/pay', expenseMock.recordPayment);
    this.handlers.set('GET /api/households/:id/balances', expenseMock.getBalances);
    this.handlers.set('GET /api/households/:id/balances/:userId', expenseMock.getUserBalance);

    // Chat endpoints
    this.handlers.set('GET /api/households/:id/messages', chatMock.getMessages);
    this.handlers.set('POST /api/households/:id/messages', chatMock.createMessage);
    this.handlers.set('PUT /api/messages/:id', chatMock.updateMessage);
    this.handlers.set('DELETE /api/messages/:id', chatMock.deleteMessage);
    this.handlers.set('POST /api/polls/:id/vote', chatMock.votePoll);
    this.handlers.set('GET /api/polls/:id/results', chatMock.getPollResults);

    // Notification endpoints
    this.handlers.set('GET /api/notifications', notificationMock.getNotifications);
    this.handlers.set('PUT /api/notifications/:id/read', notificationMock.markRead);
    this.handlers.set('PUT /api/notifications/read-all', notificationMock.markAllRead);
    this.handlers.set('DELETE /api/notifications/:id', notificationMock.deleteNotification);
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
    const patternParts = pattern.split(' ')[1].split('/');
    const keyParts = key.split(' ')[1].split('/');

    if (patternParts.length !== keyParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
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
    const match = this.matchRoute(method, url);
    
    if (!match) {
      throw {
        code: 'NOT_FOUND',
        message: `Endpoint ${method} ${url} not found`,
        status: 404,
      };
    }

    try {
      return await match.handler({
        params: match.params,
        data,
        query: queryParams,
      });
    } catch (error) {
      console.error('Mock handler error:', error);
      throw {
        code: 'MOCK_ERROR',
        message: error.message || 'Mock handler error',
        status: 500,
      };
    }
  }
}

export const mockHandlers = new MockHandlers();
