# GOTask REST API Backend Server

A lightweight, zero-dependency Node.js REST API server with persistence for GOTask.

## Features
- **Zero External Dependencies**: Runs on standard Node.js without `npm install` needed!
- **Persistent Storage**: Data saved automatically to `backend/data/db.json`.
- **CORS Enabled**: Seamless communication with React Native (Metro/Android/iOS) and Web.
- **Offline-First Sync**: Bidirectional sync endpoint `/api/sync` merges local client tasks and resolves conflicts by timestamp.
- **Full CRUD**:
  - `GET /api/tasks` (Supports filters: `category`, `status`, `priority`, `search`)
  - `POST /api/tasks`
  - `PUT /api/tasks/:id`
  - `DELETE /api/tasks/:id`
  - `GET /api/stats` (Real-time analytics & completion rates)
  - `GET /api/profile` & `PUT /api/profile`
  - `POST /api/sync` (Cloud sync)

## How to Run
```bash
node backend/server.js
```
The server will start at `http://localhost:5000`.
For Android Emulator: use `http://10.0.2.2:5000`.
For Physical Devices: use your machine's LAN IP (e.g. `http://192.168.1.x:5000`).
