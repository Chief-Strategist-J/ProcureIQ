# UI Planning: Notifications Management Dashboard

This document details the frontend implementation plan for the **Notifications Management UI** in Next.js/React.

---

## 1. Visual Layout Architecture
The interface is split into a two-column desktop workspace (collapsing to a single-column layout on mobile viewports):

### Column A: The Creator Sandbox (Left Side)
* **Form Header**: `Create and Schedule Notification`
* **Type Dropdown**: Loads active notification codes (e.g. `system_alert`, `security`, `update`) from `GET /api/v1/notifications`.
* **Scope Toggle**: Switch targeting rules between:
  * `Broadcast` (Global / all users)
  * `User` (Targeted to a specific user ID, showing a User ID numeric input field)
  * `Organization` (Targeted to a specific corporate account ID)
* **Scheduled toggle**:
  * **Option 1**: `Send Now` (sets payload parameter `scheduledFor` to `null`).
  * **Option 2**: `Schedule for later` (reveals a Date-Time selector component).
* **Priority Selector**: Slider from `1` (Info) to `5` (Critical).
* **JSON Payload Editor**: Live text area validating custom key-value pairs (e.g., alert description, links).
* **Idempotency Key Generator**: Pre-populates a random UUID in the `dedupKey` input (preventing accidental double-clicks from double-triggering).

### Column B: Recipient Feed Drawer (Right Side)
* **Feed Title**: `Notification Feed` (with a dynamic unread counter badge fetching `GET /api/v1/notifications/unread-count`).
* **Filter Options**: Tabs to filter feed cards by status (`all`, `pending`, `read`).
* **Card State Indicators**:
  * **Unread**: Displays a glowing green dot indicator.
  * **Read**: Dims details and removes the dot indicator.
* **Inline Actions**:
  * `Acknowledge` button -> PUT status to `/api/v1/notifications/{id}/status` with body `{"status":"read"}`.
  * `Dismiss` button -> PUT status to `/api/v1/notifications/{id}/status` with body `{"status":"dismissed"}`.

---

## 2. API Endpoint Integrations

| Feature | HTTP Method | Endpoint | Parameters / Headers | Payload Body |
| :--- | :--- | :--- | :--- | :--- |
| **Fetch Unread Total** | `GET` | `/api/v1/notifications/unread-count` | Header: `X-User-Id` | *(None)* |
| **Fetch Feed List** | `GET` | `/api/v1/notifications` | Header: `X-User-Id`<br>Query: `page`, `size`, `status` | *(None)* |
| **Trigger / Send** | `POST` | `/api/v1/notifications` | Content-Type: `application/json` | `{"typeCode": String, "sourceService": String, "targetScope": String, "targetId": Long, "dedupKey": String, "payload": Object, "metadata": Object, "priority": Integer, "scheduledFor": ISO-8601 Timestamp}` |
| **Update Status** | `PUT` | `/api/v1/notifications/{id}/status` | Header: `X-User-Id` | `{"status": "read" \| "dismissed"}` |
| **Register Device** | `POST` | `/api/v1/notifications/devices` | Header: `X-User-Id` | `{"platform": String, "pushToken": String, "webPushEndpoint": Object, "appVersion": String, "osVersion": String, "capabilities": Object}` |

---

## 3. UI Design System Tokens
To match modern rich aesthetics:
* **Background**: Slate dark mode (`#0B0F19`) with backdrop blur filters (`backdrop-filter: blur(12px)`).
* **Glowing Borders**: Glassmorphism cards with gradients (`border: 1px solid rgba(255, 255, 255, 0.08)`).
* **Badge Highlight**: Neon blue (`#00F2FE`) and neon purple (`#9B51E0`) accents for indicators and action markers.
