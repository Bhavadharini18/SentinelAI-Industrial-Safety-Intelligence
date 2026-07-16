# SentinelAI API Contract Documentation

This document logs REST endpoints and WebSocket namespaces for the SentinelAI Industrial Safety Intelligence Platform.

---

## 🔑 1. Authentication Services (`/api/auth`)

### 1.1 Register Operator
* **Route**: `POST /api/auth/register`
* **Access**: Public
* **Payload**:
  ```json
  {
    "name": "Operator Name",
    "email": "operator@sentinel.ai",
    "password": "password123",
    "role": "Safety Officer"
  }
  ```

### 1.2 Access Authentication Token
* **Route**: `POST /api/auth/login`
* **Access**: Public
* **Payload**:
  ```json
  {
    "email": "admin@sentinel.ai",
    "password": "password123"
  }
  ```

---

## 📈 2. Core Dashboard Aggregates (`/api/dashboard`)

### 2.1 Fetch Panel Metrics
* **Route**: `GET /api/dashboard`
* **Access**: Private (JWT Token Required)
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "safetyScore": 100,
      "workers": { "online": 3, "total": 4 },
      "machines": { "active": 3, "total": 4 },
      "sensorsCount": 5,
      "alerts": { "active": 0, "critical": 0 }
    }
  }
  ```

---

## 🛠️ 3. Safety Alarms & Incidents (`/api/alerts`, `/api/incidents`)

### 3.1 Acknowledge Hazard
* **Route**: `PUT /api/alerts/:id/acknowledge`
* **Access**: Private (Supervisor/Safety Officer/Admin)
* **Response**: Sets alert status to `Acknowledged` and logs acknowledging operator.

### 3.2 Resolve Hazard
* **Route**: `PUT /api/alerts/:id/resolve`
* **Access**: Private (Supervisor/Safety Officer/Admin)
* **Response**: Sets alert status to `Resolved`.

---

## ⚡ 4. Real-time Gateway WebSockets (Socket.IO)

Clients connect to namespace `http://localhost:5000`.

### Broadcast Channels (Listen)
* `sensor_updates`: Pushes updated live metrics Array.
* `zone_risks`: Pushes calculations computed per zone.
* `new_alert`: Fires when FastAPI calculates safety breach and triggers warning.
* `alert_updated`: Broadcasts state updates (acknowledged / resolved).
* `global_safety_score`: Pushes aggregate index value.
