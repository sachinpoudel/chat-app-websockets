
# Chat Sockets – Frontend

React + Vite frontend for a Socket.IO group chat. Shows online users, “user joined” system messages, real-time typing, and loads history from the backend. Caches recent messages in localStorage and auto-scrolls to the latest.

## Features
- Realtime messaging via Socket.IO
- Presence list (online users)
- “User joined” system notices
- Typing indicators
- Message history fetched from backend (REST)
- LocalStorage cache to survive refreshes
- Auto-reconnect and auto-rejoin

## Requirements
- Node 18+ and npm
- Backend running (Express + Socket.IO) with CORS allowing this frontend

## Setup
1) Install dependencies:
- Linux terminal
```bash
npm ci
```

2) Configure environment:
- Create a `.env.local` file in this folder with your backend URLs:
```env
VITE_API_BASE=https://your-backend.onrender.com
VITE_WS_URL=https://your-backend.onrender.com
```
- For local dev (default Vite port 5173):
```env
VITE_API_BASE=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

3) Run the dev server:
```bash
npm run dev
```
Open the printed URL (usually http://localhost:5173).

## Build
- Production build:
```bash
npm run build
```
- Preview the production build locally:
```bash
npm run preview
```

## Deployment (Render – Static Site)
- Root Directory: frontend
- Build Command: npm ci && npm run build
- Publish Directory: dist
- Environment Variables:
  - VITE_API_BASE=https://your-backend.onrender.com
  - VITE_WS_URL=https://your-backend.onrender.com

Ensure your backend (on Render Web Service) has CORS configured to allow the frontend domain.

## Configuration Notes
- The app uses a singleton Socket.IO client with websocket transport and auto-reconnect.
- On reconnect, the client re-emits join with your saved userName.
- Messages are cached in localStorage so they don’t disappear on refresh. The authoritative history comes from the backend GET /api/messages.
- Presence is pushed by the server via a “presence” event and rendered in the header.
- “User joined” lines are appended as system messages; these are also cached locally.

## Scripts
- npm run dev – start Vite dev server
- npm run build – build for production
- npm run preview – preview production build

## Folder Structure (key files)
- src/App.tsx – main UI and socket/event logic
- src/ws.ts – Socket.IO client (singleton)
- src/api.ts – Axios instance (uses VITE_API_BASE)

## Troubleshooting
- Seeing duplicate “joined” notices in dev: React StrictMode can double-mount. Use the included de-dup logic or temporarily remove StrictMode in main.tsx during debugging.
- 404 on /api/messages: ensure the backend exposes GET /api/messages and VITE_API_BASE is set correctly.
- CORS errors: update backend CORS origin to your frontend URL on