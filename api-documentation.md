# API Documentation for Component Development

Generated: 2025-08-13T19:46:32.928Z

## 🚀 Quick Reference for Components

### Available Methods to Call:

#### From Custom Hooks:
**useChat:**
- `old`
- `firstPage`
- `optimisticMessage`
- `previousMessages`
- `page`
- `messages`
- `isLoading`
- `isPending`
- `isFetchingNextPage`
- `error`
- `hasNextPage`
- `loadMore`
- `sendMessage`
- `sendPoll`
- `replyToMessage`
- `editMessage`
- `deleteMessage`
- `votePoll`
- `uploadFile`
- `searchMessages`
- `reactToMessage`
- `removeReaction`
- `refetchMessages`
- `getMessageById`
- `getReplies`
- `getRecentMessages`
- `length`
- `0`
- `useChat` - const useChat = (options = {}) =>

**useExpenses:**
- `old`
- `data`
- `summary`
- `amount`
- `previousBalances`
- `null`
- `balancesLoading`
- `billsLoading`
- `balancesError`
- `billsError`
- `isPending`
- `mutateAsync`
- `billId`
- `useExpenses` - const useExpenses = (filters = {}) =>
- `getBillById` - const getBillById = (billId) =>
- `getPendingBills` - const getPendingBills = () =>
- `getOverdueBills` - const getOverdueBills = () =>
- `getTotalOwed` - const getTotalOwed = () =>
- `getUserBalance` - const getUserBalance = (userId) =>
- `exportBills` - const exportBills = async (format = 'csv', exportFilters = {}) =>

**useTasks:**
- `old`
- `task`
- `assignment`
- `previousTasks`
- `completed_at`
- `swapsLoading`
- `tasksLoading`
- `swapsError`
- `tasksError`
- `isPending`
- `mutateAsync`
- `taskId`
- `data`
- `useTasks` - const useTasks = (filters = {}) =>
- `getTaskById` - const getTaskById = (taskId) =>
- `getMyTasks` - const getMyTasks = () =>
- `getPendingTasks` - const getPendingTasks = () =>
- `getCompletedTasks` - const getCompletedTasks = () =>
- `getOverdueTasks` - const getOverdueTasks = () =>
- `getTasksDueToday` - const getTasksDueToday = () =>
- `getRecurringTasks` - const getRecurringTasks = () =>
- `getPendingSwapsForMe` - const getPendingSwapsForMe = () =>
- `getMySwapRequests` - const getMySwapRequests = () =>

**useRealtime:**
- `channel`
- `subscription`
- `old`
- `firstPage`
- `newMessage`
- `page`
- `newNotification`
- `1`
- `isConnected`
- `connectionError`
- `createSubscription`
- `removeSubscription`
- `subscribeToChatMessages`
- `subscribeToNotifications`
- `subscribeToTaskUpdates`
- `subscribeToExpenseUpdates`
- `subscribeToPresence`
- `reconnect`
- `useRealtime` - const useRealtime = () =>

#### From Context Providers:
#### Direct API Calls:
**auth.js:**
- `authAPI` - export

**chat.js:**
- `chatAPI` - export

**expenses.js:**
- `expensesAPI` - export

**households.js:**
- `householdsAPI` - export

**notifications.js:**
- `notificationsAPI` - export

**tasks.js:**
- `tasksAPI` - export

## 📊 Summary

- Total API Files: 7
- Total Mock Data Files: 6
- Total Hooks: 4
- Total Contexts: 4

## 🔌 API Endpoints

### auth.js

**Callable Functions:**
- `authAPI`
  - Type: export
  - Full: `export const authAPI =`

**HTTP Endpoints:**
- `get()` → `GET /api/profile`
  - Full call: `await client.get("/api/profile")`
- `put()` → `PUT /api/profile`
  - Parameters: `, data`
  - Full call: `await client.put("/api/profile", data)`
- `append()` → `APPEND avatar`
  - Parameters: `, file`
  - Full call: `append("avatar", file)`
- `post()` → `POST /api/profile/avatar`
  - Parameters: `, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }`
  - Full call: `await client.post("/api/profile/avatar", formData, { headers: { "Content-Type": "multipart/form-data", }, })`
- `post()` → `POST /api/invite/validate`
  - Parameters: `, {
      invite_code: inviteCode,
    }`
  - Full call: `await client.post("/api/invite/validate", { invite_code: inviteCode, })`
- `post()` → `POST /api/invite/join`
  - Parameters: `, {
      invite_code: inviteCode,
    }`
  - Full call: `await client.post("/api/invite/join", { invite_code: inviteCode, })`
- `post()` → `POST /api/auth/refresh`
  - Full call: `await client.post("/api/auth/refresh")`
- `post()` → `POST /api/auth/logout`
  - Full call: `await client.post("/api/auth/logout")`

### chat.js

**Callable Functions:**
- `chatAPI`
  - Type: export
  - Full: `export const chatAPI =`

**HTTP Endpoints:**
- `append()` → `APPEND page`
  - Parameters: `, options.page`
  - Full call: `append('page', options.page)`
- `append()` → `APPEND limit`
  - Parameters: `, options.limit`
  - Full call: `append('limit', options.limit)`
- `append()` → `APPEND before`
  - Parameters: `, options.before`
  - Full call: `append('before', options.before)`
- `append()` → `APPEND after`
  - Parameters: `, options.after`
  - Full call: `append('after', options.after)`
- `post()` → `POST /api/households/${householdId}/messages`
  - Parameters: `, data`
  - Full call: `await client.post(`/api/households/${householdId}/messages`, data)`
- `put()` → `PUT /api/messages/${messageId}`
  - Parameters: `, data`
  - Full call: `await client.put(`/api/messages/${messageId}`, data)`
- `delete()` → `DELETE /api/messages/${messageId}`
  - Full call: `await client.delete(`/api/messages/${messageId}`)`
- `post()` → `POST /api/polls/${pollId}/vote`
  - Parameters: `, {
      selected_options: selectedOptions,
    }`
  - Full call: `await client.post(`/api/polls/${pollId}/vote`, { selected_options: selectedOptions, })`
- `get()` → `GET /api/polls/${pollId}/results`
  - Full call: `await client.get(`/api/polls/${pollId}/results`)`
- `append()` → `APPEND file`
  - Parameters: `, file`
  - Full call: `append('file', file)`
- `append()` → `APPEND message_data`
  - Parameters: `, JSON.stringify(messageData`
  - Full call: `append('message_data', JSON.stringify(messageData)`
- `post()` → `POST /api/households/${householdId}/messages/upload`
  - Parameters: `,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }`
  - Full call: `await client.post( `/api/households/${householdId}/messages/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data', }, } )`
- `get()` → `GET /api/households/${householdId}/messages/search?${params.toString()}`
  - Full call: `await client.get( `/api/households/${householdId}/messages/search?${params.toString()}` )`
- `get()` → `GET /api/messages/${messageId}/thread`
  - Full call: `await client.get(`/api/messages/${messageId}/thread`)`
- `post()` → `POST /api/messages/${messageId}/react`
  - Parameters: `, {
      reaction,
    }`
  - Full call: `await client.post(`/api/messages/${messageId}/react`, { reaction, })`
- `delete()` → `DELETE /api/messages/${messageId}/react`
  - Parameters: `, {
      data: { reaction },
    }`
  - Full call: `await client.delete(`/api/messages/${messageId}/react`, { data: { reaction }, })`
- `template()` → `TEMPLATE /api/households/${householdId}/messages?${queryString}`
  - Full call: ``/api/households/${householdId}/messages?${queryString}``
- `template()` → `TEMPLATE /api/households/${householdId}/messages`
  - Full call: ``/api/households/${householdId}/messages``
- `template()` → `TEMPLATE /api/households/${householdId}/messages`
  - Full call: ``/api/households/${householdId}/messages``
- `template()` → `TEMPLATE /api/messages/${messageId}`
  - Full call: ``/api/messages/${messageId}``
- `template()` → `TEMPLATE /api/messages/${messageId}`
  - Full call: ``/api/messages/${messageId}``
- `template()` → `TEMPLATE /api/polls/${pollId}/vote`
  - Full call: ``/api/polls/${pollId}/vote``
- `template()` → `TEMPLATE /api/polls/${pollId}/results`
  - Full call: ``/api/polls/${pollId}/results``
- `template()` → `TEMPLATE /api/households/${householdId}/messages/upload`
  - Full call: ``/api/households/${householdId}/messages/upload``
- `template()` → `TEMPLATE /api/households/${householdId}/messages/search?${params.toString()}`
  - Full call: ``/api/households/${householdId}/messages/search?${params.toString()}``
- `template()` → `TEMPLATE /api/messages/${messageId}/thread`
  - Full call: ``/api/messages/${messageId}/thread``
- `template()` → `TEMPLATE /api/messages/${messageId}/react`
  - Full call: ``/api/messages/${messageId}/react``
- `template()` → `TEMPLATE /api/messages/${messageId}/react`
  - Full call: ``/api/messages/${messageId}/react``

### client.js

**HTTP Endpoints:**
- `Error()` → `ERROR Invalid API response structure`
  - Full call: `Error("Invalid API response structure")`
- `error()` → `ERROR API Request Error:`
  - Parameters: `, error`
  - Full call: `error("API Request Error:", error)`

### expenses.js

**Callable Functions:**
- `expensesAPI`
  - Type: export
  - Full: `export const expensesAPI =`

**HTTP Endpoints:**
- `append()` → `APPEND status`
  - Parameters: `, filters.status`
  - Full call: `append('status', filters.status)`
- `append()` → `APPEND category`
  - Parameters: `, filters.category`
  - Full call: `append('category', filters.category)`
- `append()` → `APPEND paid_by`
  - Parameters: `, filters.paid_by`
  - Full call: `append('paid_by', filters.paid_by)`
- `append()` → `APPEND due_date_from`
  - Parameters: `, filters.due_date_from`
  - Full call: `append('due_date_from', filters.due_date_from)`
- `append()` → `APPEND due_date_to`
  - Parameters: `, filters.due_date_to`
  - Full call: `append('due_date_to', filters.due_date_to)`
- `post()` → `POST /api/households/${householdId}/bills`
  - Parameters: `, data`
  - Full call: `await client.post(`/api/households/${householdId}/bills`, data)`
- `get()` → `GET /api/bills/${billId}`
  - Full call: `await client.get(`/api/bills/${billId}`)`
- `put()` → `PUT /api/bills/${billId}`
  - Parameters: `, data`
  - Full call: `await client.put(`/api/bills/${billId}`, data)`
- `delete()` → `DELETE /api/bills/${billId}`
  - Full call: `await client.delete(`/api/bills/${billId}`)`
- `put()` → `PUT /api/bills/${billId}/split`
  - Parameters: `, {
      splits,
    }`
  - Full call: `await client.put(`/api/bills/${billId}/split`, { splits, })`
- `post()` → `POST /api/bills/${billId}/pay`
  - Parameters: `, data`
  - Full call: `await client.post(`/api/bills/${billId}/pay`, data)`
- `get()` → `GET /api/households/${householdId}/balances`
  - Full call: `await client.get(`/api/households/${householdId}/balances`)`
- `get()` → `GET /api/households/${householdId}/balances/${userId}`
  - Full call: `await client.get(`/api/households/${householdId}/balances/${userId}`)`
- `post()` → `POST /api/bills/batch/pay`
  - Parameters: `, {
      payments, // [{ bill_id, split_id, amount, paid_date }]
    }`
  - Full call: `await client.post('/api/bills/batch/pay', { payments, // [{ bill_id, split_id, amount, paid_date }] })`
- `get()` → `GET /api/households/${householdId}/settlement`
  - Full call: `await client.get(`/api/households/${householdId}/settlement`)`
- `post()` → `POST /api/households/${householdId}/settlement`
  - Parameters: `, {
      settlements, // [{ from_user_id, to_user_id, amount }]
    }`
  - Full call: `await client.post(`/api/households/${householdId}/settlement`, { settlements, // [{ from_user_id, to_user_id, amount }] })`
- `get()` → `GET /api/households/${householdId}/bills/export?${params.toString()}`
  - Parameters: `,
      { responseType: 'blob' }`
  - Full call: `await client.get( `/api/households/${householdId}/bills/export?${params.toString()}`, { responseType: 'blob' } )`
- `template()` → `TEMPLATE /api/households/${householdId}/bills?${queryString}`
  - Full call: ``/api/households/${householdId}/bills?${queryString}``
- `template()` → `TEMPLATE /api/households/${householdId}/bills`
  - Full call: ``/api/households/${householdId}/bills``
- `template()` → `TEMPLATE /api/households/${householdId}/bills`
  - Full call: ``/api/households/${householdId}/bills``
- `template()` → `TEMPLATE /api/bills/${billId}`
  - Full call: ``/api/bills/${billId}``
- `template()` → `TEMPLATE /api/bills/${billId}`
  - Full call: ``/api/bills/${billId}``
- `template()` → `TEMPLATE /api/bills/${billId}`
  - Full call: ``/api/bills/${billId}``
- `template()` → `TEMPLATE /api/bills/${billId}/split`
  - Full call: ``/api/bills/${billId}/split``
- `template()` → `TEMPLATE /api/bills/${billId}/pay`
  - Full call: ``/api/bills/${billId}/pay``
- `template()` → `TEMPLATE /api/households/${householdId}/balances`
  - Full call: ``/api/households/${householdId}/balances``
- `template()` → `TEMPLATE /api/households/${householdId}/balances/${userId}`
  - Full call: ``/api/households/${householdId}/balances/${userId}``
- `template()` → `TEMPLATE /api/households/${householdId}/settlement`
  - Full call: ``/api/households/${householdId}/settlement``
- `template()` → `TEMPLATE /api/households/${householdId}/settlement`
  - Full call: ``/api/households/${householdId}/settlement``
- `template()` → `TEMPLATE /api/households/${householdId}/bills/export?${params.toString()}`
  - Full call: ``/api/households/${householdId}/bills/export?${params.toString()}``

### households.js

**Callable Functions:**
- `householdsAPI`
  - Type: export
  - Full: `export const householdsAPI =`

**HTTP Endpoints:**
- `get()` → `GET /api/households`
  - Full call: `await client.get("/api/households")`
- `post()` → `POST /api/households`
  - Parameters: `, data`
  - Full call: `await client.post("/api/households", data)`
- `get()` → `GET /api/households/${householdId}`
  - Full call: `await client.get(`/api/households/${householdId}`)`
- `put()` → `PUT /api/households/${householdId}`
  - Parameters: `, data`
  - Full call: `await client.put(`/api/households/${householdId}`, data)`
- `delete()` → `DELETE /api/households/${householdId}`
  - Full call: `await client.delete(`/api/households/${householdId}`)`
- `get()` → `GET /api/households/${householdId}/members`
  - Full call: `await client.get(`/api/households/${householdId}/members`)`
- `post()` → `POST /api/households/${householdId}/invite`
  - Full call: `await client.post(`/api/households/${householdId}/invite`)`
- `delete()` → `DELETE /api/households/${householdId}/members/${userId}`
  - Full call: `await client.delete(`/api/households/${householdId}/members/${userId}`)`
- `post()` → `POST /api/households/${householdId}/leave`
  - Full call: `await client.post(`/api/households/${householdId}/leave`)`
- `get()` → `GET /api/households/${householdId}/dashboard`
  - Full call: `await client.get(`/api/households/${householdId}/dashboard`)`
- `StorageEvent()` → `STORAGEEVENT storage`
  - Parameters: `, {
        key: "activeHouseholdId",
        newValue: householdId,
      }`
  - Full call: `StorageEvent("storage", { key: "activeHouseholdId", newValue: householdId, })`
- `template()` → `TEMPLATE /api/households/${householdId}`
  - Full call: ``/api/households/${householdId}``
- `template()` → `TEMPLATE /api/households/${householdId}`
  - Full call: ``/api/households/${householdId}``
- `template()` → `TEMPLATE /api/households/${householdId}`
  - Full call: ``/api/households/${householdId}``
- `template()` → `TEMPLATE /api/households/${householdId}/members`
  - Full call: ``/api/households/${householdId}/members``
- `template()` → `TEMPLATE /api/households/${householdId}/invite`
  - Full call: ``/api/households/${householdId}/invite``
- `template()` → `TEMPLATE /api/households/${householdId}/members/${userId}`
  - Full call: ``/api/households/${householdId}/members/${userId}``
- `template()` → `TEMPLATE /api/households/${householdId}/leave`
  - Full call: ``/api/households/${householdId}/leave``
- `template()` → `TEMPLATE /api/households/${householdId}/dashboard`
  - Full call: ``/api/households/${householdId}/dashboard``

### notifications.js

**Callable Functions:**
- `notificationsAPI`
  - Type: export
  - Full: `export const notificationsAPI =`

**HTTP Endpoints:**
- `append()` → `APPEND read`
  - Parameters: `, options.read`
  - Full call: `append('read', options.read)`
- `append()` → `APPEND type`
  - Parameters: `, options.type`
  - Full call: `append('type', options.type)`
- `append()` → `APPEND page`
  - Parameters: `, options.page`
  - Full call: `append('page', options.page)`
- `append()` → `APPEND limit`
  - Parameters: `, options.limit`
  - Full call: `append('limit', options.limit)`
- `put()` → `PUT /api/notifications/${notificationId}/read`
  - Full call: `await client.put(`/api/notifications/${notificationId}/read`)`
- `put()` → `PUT /api/notifications/read-all`
  - Full call: `await client.put('/api/notifications/read-all')`
- `delete()` → `DELETE /api/notifications/${notificationId}`
  - Full call: `await client.delete(`/api/notifications/${notificationId}`)`
- `get()` → `GET /api/notifications/unread-count`
  - Full call: `await client.get('/api/notifications/unread-count')`
- `put()` → `PUT /api/notifications/preferences`
  - Parameters: `, preferences`
  - Full call: `await client.put('/api/notifications/preferences', preferences)`
- `get()` → `GET /api/notifications/preferences`
  - Full call: `await client.get('/api/notifications/preferences')`
- `post()` → `POST /api/notifications/batch/read`
  - Parameters: `, {
      notification_ids: notificationIds,
    }`
  - Full call: `await client.post('/api/notifications/batch/read', { notification_ids: notificationIds, })`
- `post()` → `POST /api/notifications/batch/delete`
  - Parameters: `, {
      notification_ids: notificationIds,
    }`
  - Full call: `await client.post('/api/notifications/batch/delete', { notification_ids: notificationIds, })`
- `template()` → `TEMPLATE /api/notifications?${queryString}`
  - Full call: ``/api/notifications?${queryString}``
- `template()` → `TEMPLATE /api/notifications/${notificationId}/read`
  - Full call: ``/api/notifications/${notificationId}/read``
- `template()` → `TEMPLATE /api/notifications/${notificationId}`
  - Full call: ``/api/notifications/${notificationId}``

### tasks.js

**Callable Functions:**
- `tasksAPI`
  - Type: export
  - Full: `export const tasksAPI =`

**HTTP Endpoints:**
- `append()` → `APPEND status`
  - Parameters: `, filters.status`
  - Full call: `append('status', filters.status)`
- `append()` → `APPEND assignee`
  - Parameters: `, filters.assignee`
  - Full call: `append('assignee', filters.assignee)`
- `append()` → `APPEND due_date`
  - Parameters: `, filters.due_date`
  - Full call: `append('due_date', filters.due_date)`
- `append()` → `APPEND is_recurring`
  - Parameters: `, filters.is_recurring`
  - Full call: `append('is_recurring', filters.is_recurring)`
- `post()` → `POST /api/households/${householdId}/tasks`
  - Parameters: `, data`
  - Full call: `await client.post(`/api/households/${householdId}/tasks`, data)`
- `get()` → `GET /api/tasks/${taskId}`
  - Full call: `await client.get(`/api/tasks/${taskId}`)`
- `put()` → `PUT /api/tasks/${taskId}`
  - Parameters: `, data`
  - Full call: `await client.put(`/api/tasks/${taskId}`, data)`
- `delete()` → `DELETE /api/tasks/${taskId}`
  - Full call: `await client.delete(`/api/tasks/${taskId}`)`
- `post()` → `POST /api/tasks/${taskId}/assign`
  - Parameters: `, {
      assigned_to: userIds,
    }`
  - Full call: `await client.post(`/api/tasks/${taskId}/assign`, { assigned_to: userIds, })`
- `put()` → `PUT /api/tasks/${taskId}/complete`
  - Full call: `await client.put(`/api/tasks/${taskId}/complete`)`
- `put()` → `PUT /api/tasks/${taskId}/uncomplete`
  - Full call: `await client.put(`/api/tasks/${taskId}/uncomplete`)`
- `post()` → `POST /api/tasks/${taskId}/swap/request`
  - Parameters: `, data`
  - Full call: `await client.post(`/api/tasks/${taskId}/swap/request`, data)`
- `put()` → `PUT /api/task-swaps/${swapId}/accept`
  - Full call: `await client.put(`/api/task-swaps/${swapId}/accept`)`
- `put()` → `PUT /api/task-swaps/${swapId}/decline`
  - Full call: `await client.put(`/api/task-swaps/${swapId}/decline`)`
- `get()` → `GET /api/households/${householdId}/task-swaps`
  - Full call: `await client.get(`/api/households/${householdId}/task-swaps`)`
- `post()` → `POST /api/tasks/batch/complete`
  - Parameters: `, {
      task_ids: taskIds,
    }`
  - Full call: `await client.post('/api/tasks/batch/complete', { task_ids: taskIds, })`
- `post()` → `POST /api/tasks/batch/assign`
  - Parameters: `, {
      assignments, // [{ task_id, user_ids }]
    }`
  - Full call: `await client.post('/api/tasks/batch/assign', { assignments, // [{ task_id, user_ids }] })`
- `template()` → `TEMPLATE /api/households/${householdId}/tasks?${queryString}`
  - Full call: ``/api/households/${householdId}/tasks?${queryString}``
- `template()` → `TEMPLATE /api/households/${householdId}/tasks`
  - Full call: ``/api/households/${householdId}/tasks``
- `template()` → `TEMPLATE /api/households/${householdId}/tasks`
  - Full call: ``/api/households/${householdId}/tasks``
- `template()` → `TEMPLATE /api/tasks/${taskId}`
  - Full call: ``/api/tasks/${taskId}``
- `template()` → `TEMPLATE /api/tasks/${taskId}`
  - Full call: ``/api/tasks/${taskId}``
- `template()` → `TEMPLATE /api/tasks/${taskId}`
  - Full call: ``/api/tasks/${taskId}``
- `template()` → `TEMPLATE /api/tasks/${taskId}/assign`
  - Full call: ``/api/tasks/${taskId}/assign``
- `template()` → `TEMPLATE /api/tasks/${taskId}/complete`
  - Full call: ``/api/tasks/${taskId}/complete``
- `template()` → `TEMPLATE /api/tasks/${taskId}/uncomplete`
  - Full call: ``/api/tasks/${taskId}/uncomplete``
- `template()` → `TEMPLATE /api/tasks/${taskId}/swap/request`
  - Full call: ``/api/tasks/${taskId}/swap/request``
- `template()` → `TEMPLATE /api/task-swaps/${swapId}/accept`
  - Full call: ``/api/task-swaps/${swapId}/accept``
- `template()` → `TEMPLATE /api/task-swaps/${swapId}/decline`
  - Full call: ``/api/task-swaps/${swapId}/decline``
- `template()` → `TEMPLATE /api/households/${householdId}/task-swaps`
  - Full call: ``/api/households/${householdId}/task-swaps``

## 🎭 Data Structures & Response Formats

### expenses.js

```json
{
  "householdBalances": {
    "summary": "object",
    "total_owed_to_household": "unknown",
    "total_owed_by_household": "number",
    "net_balance": "unknown",
    "member_balances": "array",
    "user_id": "string",
    "user_name": "string",
    "avatar_url": "string",
    "total_owed": "unknown",
    "total_paid": "unknown",
    "recent_transactions": "array",
    "id": "string",
    "bill_title": "string",
    "amount": "unknown",
    "paid_date": "string"
  }
}
```

### households.js

```json
{
  "dashboardData": {
    "kpis": "object",
    "outstanding_tasks": "number",
    "total_balance_owed": "unknown",
    "upcoming_deadlines": "number",
    "recent_activity_count": "number",
    "calendar_events": "array",
    "id": "string",
    "title": "string",
    "date": "string",
    "type": "string",
    "amount": "unknown",
    "assigned_to": "string",
    "recent_activity": "array",
    "message": "string",
    "timestamp": "string",
    "user": "object",
    "name": "string",
    "avatar_url": "string"
  }
}
```

### messages.js

```json
{}
```

### notifications.js

```json
{}
```

### tasks.js

```json
{}
```

### users.js

```json
{
  "currentUser": {
    "id": "string",
    "email": "string",
    "full_name": "string",
    "avatar_url": "string",
    "phone": "string",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

## 🎣 Custom Hooks - Component Interface

### useChat

**How to use in components:**
```javascript
const { old, firstPage, optimisticMessage, previousMessages, page, messages, isLoading, isPending, isFetchingNextPage, error, hasNextPage, loadMore, sendMessage, sendPoll, replyToMessage, editMessage, deleteMessage, votePoll, uploadFile, searchMessages, reactToMessage, removeReaction, refetchMessages, getMessageById, getReplies, getRecentMessages, length, 0 } = useChat();
```

**Available Methods:**
- `old`
- `firstPage`
- `optimisticMessage`
- `previousMessages`
- `page`
- `messages`
- `isLoading`
- `isPending`
- `isFetchingNextPage`
- `error`
- `hasNextPage`
- `loadMore`
- `sendMessage`
- `sendPoll`
- `replyToMessage`
- `editMessage`
- `deleteMessage`
- `votePoll`
- `uploadFile`
- `searchMessages`
- `reactToMessage`
- `removeReaction`
- `refetchMessages`
- `getMessageById`
- `getReplies`
- `getRecentMessages`
- `length`
- `0`
- `useChat` - const useChat = (options = {}) =>

### useExpenses

**How to use in components:**
```javascript
const { old, data, summary, amount, previousBalances, null, balancesLoading, billsLoading, balancesError, billsError, isPending, mutateAsync, billId } = useExpenses();
```

**Available Methods:**
- `old`
- `data`
- `summary`
- `amount`
- `previousBalances`
- `null`
- `balancesLoading`
- `billsLoading`
- `balancesError`
- `billsError`
- `isPending`
- `mutateAsync`
- `billId`
- `useExpenses` - const useExpenses = (filters = {}) =>
- `getBillById` - const getBillById = (billId) =>
- `getPendingBills` - const getPendingBills = () =>
- `getOverdueBills` - const getOverdueBills = () =>
- `getTotalOwed` - const getTotalOwed = () =>
- `getUserBalance` - const getUserBalance = (userId) =>
- `exportBills` - const exportBills = async (format = 'csv', exportFilters = {}) =>

**Internal API Calls:**
- `createElement()` → `CREATEELEMENT a`
- `setAttribute()` → `SETATTRIBUTE download`
- `split()` → `SPLIT T`

### useTasks

**How to use in components:**
```javascript
const { old, task, assignment, previousTasks, completed_at, swapsLoading, tasksLoading, swapsError, tasksError, isPending, mutateAsync, taskId, data } = useTasks();
```

**Available Methods:**
- `old`
- `task`
- `assignment`
- `previousTasks`
- `completed_at`
- `swapsLoading`
- `tasksLoading`
- `swapsError`
- `tasksError`
- `isPending`
- `mutateAsync`
- `taskId`
- `data`
- `useTasks` - const useTasks = (filters = {}) =>
- `getTaskById` - const getTaskById = (taskId) =>
- `getMyTasks` - const getMyTasks = () =>
- `getPendingTasks` - const getPendingTasks = () =>
- `getCompletedTasks` - const getCompletedTasks = () =>
- `getOverdueTasks` - const getOverdueTasks = () =>
- `getTasksDueToday` - const getTasksDueToday = () =>
- `getRecurringTasks` - const getRecurringTasks = () =>
- `getPendingSwapsForMe` - const getPendingSwapsForMe = () =>
- `getMySwapRequests` - const getMySwapRequests = () =>

**Internal API Calls:**
- `split()` → `SPLIT T`

### useRealtime

**How to use in components:**
```javascript
const { channel, subscription, old, firstPage, newMessage, page, newNotification, 1, isConnected, connectionError, createSubscription, removeSubscription, subscribeToChatMessages, subscribeToNotifications, subscribeToTaskUpdates, subscribeToExpenseUpdates, subscribeToPresence, reconnect } = useRealtime();
```

**Available Methods:**
- `channel`
- `subscription`
- `old`
- `firstPage`
- `newMessage`
- `page`
- `newNotification`
- `1`
- `isConnected`
- `connectionError`
- `createSubscription`
- `removeSubscription`
- `subscribeToChatMessages`
- `subscribeToNotifications`
- `subscribeToTaskUpdates`
- `subscribeToExpenseUpdates`
- `subscribeToPresence`
- `reconnect`
- `useRealtime` - const useRealtime = () =>

**State Variables:**
- `isConnected` (state) / `setIsConnected` (setter)
- `connectionError` (state) / `setConnectionError` (setter)

**Internal API Calls:**
- `log()` → `LOG Real-time features disabled`
- `import()` → `IMPORT @supabase/supabase-js`
- `Error()` → `ERROR Supabase environment variables not configured`
- `error()` → `ERROR Failed to initialize Supabase client:`
- `on()` → `ON postgres_changes`
- `error()` → `ERROR Error handling realtime data:`
- `on()` → `ON presence`
- `on()` → `ON presence`
- `on()` → `ON presence`
- `log()` → `LOG ✅ Subscribed to ${channelName}`
- `error()` → `ERROR ❌ Subscription error for ${channelName}`
- `error()` → `ERROR Failed to create subscription ${channelName}:`
- `log()` → `LOG 🔌 Unsubscribed from ${channelName}`
- `error()` → `ERROR Chat subscription error:`
- `log()` → `LOG Presence sync:`
- `log()` → `LOG User joined:`
- `log()` → `LOG User left:`
- `removeSubscription()` → `REMOVESUBSCRIPTION chat:${activeHouseholdId}`
- `removeSubscription()` → `REMOVESUBSCRIPTION tasks:${activeHouseholdId}`
- `removeSubscription()` → `REMOVESUBSCRIPTION expenses:${activeHouseholdId}`
- `removeSubscription()` → `REMOVESUBSCRIPTION presence:${activeHouseholdId}`

## 🏗️ Context Providers - Global State

### Auth Context

**Available Actions:**
- `SET_USER`
- `SET_ERROR`
- `SET_USER`
- `LOGOUT`
- `SET_USER`
- `SET_ERROR`
- `SET_LOADING`
- `SET_USER`
- `LOGOUT`

### Household Context

**Available Actions:**
- `SET_ERROR`
- `SET_HOUSEHOLDS`
- `SET_ACTIVE_HOUSEHOLD`
- `SET_MEMBERS`
- `SET_DASHBOARD_DATA`
- `SET_LOADING`
- `SET_ERROR`
- `CLEAR_ERROR`

### Notification Context

**Available Actions:**
- `SET_ERROR`
- `MARK_READ_OPTIMISTIC`
- `MARK_READ_SUCCESS`
- `MARK_READ_ERROR`
- `MARK_ALL_READ_OPTIMISTIC`
- `SET_NOTIFICATIONS`
- `MARK_ALL_READ_ERROR`
- `REMOVE_NOTIFICATION`
- `SET_NOTIFICATIONS`
- `SET_PREFERENCES`
- `ADD_NOTIFICATION`
- `UPDATE_NOTIFICATION`
- `REMOVE_NOTIFICATION`
- `SET_NOTIFICATIONS`
- `SET_UNREAD_COUNT`
- `SET_PREFERENCES`
- `CLEAR_ERROR`

### Theme Context

**Available Actions:**
- `SET_SYSTEM_THEME`
- `SET_SYSTEM_THEME`
- `SET_REDUCED_MOTION`
- `SET_REDUCED_MOTION`
- `SET_THEME`
- `SET_HIGH_CONTRAST`
- `SET_REDUCED_MOTION`

