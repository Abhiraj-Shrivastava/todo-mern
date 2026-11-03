# To-Do List App (MERN)

**Live app:** https://abhiraj-todo-mern.netlify.app
**API:** https://todo-api-v4gc.onrender.com/api/health (free Render instance: the first request after a
quiet period can take up to a minute while it wakes up)

A mobile-first to-do app built for the SDE-1 (MERN Stack) assignment. You can create,
edit, delete and search tasks, schedule them for a date and time, and follow your
progress week by week (Monday to Sunday).

- **M**ongoDB + Mongoose: data store
- **E**xpress 5: REST API (`/server`)
- **R**eact 19 + Vite + Tailwind CSS 4: UI built from the Figma design (`/client`)
- **N**ode.js 20+

---

## Features

| Requirement | Where it lives |
| --- | --- |
| Create task: title*, description, date & time*, priority (Low / Medium / High) | **+** button → "Add New Task" sheet. The Figma "Set Time · Start / Ends" fields map to the task's date & time plus an optional end time |
| Edit any attribute | Pencil icon on a task, or open a task → **Edit** |
| Delete task | **Swipe left** on a task → **Delete**, or the trash icon (asks for confirmation) |
| Search by keyword (title or description) | Search bar on Home → search screen. Every keyword must match, matches are highlighted, and each result can be viewed, edited or deleted |
| Weekly organisation (Mon–Sun) | Home → **Weekly Overview**: one card per week with **Open** and **Completed** counts. Tap a card to expand that week's tasks |
| Mark Completed / In Progress | Checkbox on any task, or **Mark as completed** in the task details. Counts and progress update straight away |
| Home screen (Figma) | Week day strip, Task Complete / Task Pending cards, Weekly Progress bar, the selected day's tasks (**View All** shows the whole week) |
| Onboarding (Figma) | Shown on first launch ("Manage What To Do" → **Get Started**) |
| Responsive mobile UI | Works from 320 px phones upwards. On tablets and desktops the app sits in a centred phone-width column |

Weeks are grouped in the **user's own time zone**: the browser sends its IANA zone
(for example `Asia/Kolkata`), and MongoDB's `$dateTrunc` puts week boundaries at local
Monday 00:00, which also holds across daylight-saving changes.

---

## Project structure

```
todo-app/
├── package.json            # root helper scripts (install everything, run both apps)
├── netlify.toml            # Netlify build config for the client
├── render.yaml             # Render blueprint for the API
├── server/                 # Express + MongoDB API
│   ├── src/
│   │   ├── app.js                  # express app (middleware, routes)
│   │   ├── server.js               # entry point: connect DB, listen
│   │   ├── config/db.js
│   │   ├── models/Task.js          # Mongoose schema and validation
│   │   ├── controllers/taskController.js
│   │   ├── routes/taskRoutes.js
│   │   └── middleware/errorHandler.js
│   ├── scripts/
│   │   ├── dev-memory.js           # run the API with an in-memory MongoDB
│   │   ├── seed.js                 # load sample tasks
│   │   └── sampleTasks.js
│   └── .env.example
└── client/                 # React + Vite + Tailwind UI
    ├── src/
    │   ├── pages/        Onboarding.jsx, Home.jsx, Search.jsx
    │   ├── components/   TaskRow (swipe to delete), TaskFormSheet, TaskDetailSheet,
    │   │                 WeekStrip, WeekSummary, WeekCard, BottomSheet, ...
    │   ├── context/      TaskActionsContext (sheets + mutations), ToastContext
    │   ├── hooks/        useFetch, useDebouncedValue
    │   ├── api/tasks.js  fetch wrapper for the REST API
    │   └── utils/        dates.js, onboarding.js
    └── .env.example
```

---

## Setting it up on another computer

### 1. Prerequisites

- **Node.js 20 LTS or newer** (includes npm). Check with:

  ```bash
  node -v
  ```

  Download it from https://nodejs.org if needed.
- **MongoDB** is optional for local use (see Option A). For a database that keeps
  your data, use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or a
  local MongoDB **5.0 or newer**.

### 2. Get the code

Unzip `todo-app.zip` (or `git clone` your repository) and open a terminal in the
`todo-app` folder:

```bash
cd todo-app
```

### 3. Install dependencies

One command installs the root, `server` and `client` packages:

```bash
npm install
```

### 4a. Option A: run without installing MongoDB (quickest)

```bash
npm run dev:memory
```

This starts the API with a temporary in-memory MongoDB, loads sample tasks, and
starts the React app. Then open **http://localhost:5173**.

> The first run downloads a MongoDB binary (a few hundred MB), which is cached for
> later runs. Data resets every time you stop the server.

### 4b. Option B: run with your own MongoDB (data is kept)

1. Create the server's environment file:

   macOS / Linux:

   ```bash
   cp server/.env.example server/.env
   ```

   Windows (PowerShell or cmd):

   ```bash
   copy server\.env.example server\.env
   ```

2. Open `server/.env` and set `MONGODB_URI`, for example:
   - Local: `mongodb://127.0.0.1:27017/todo`
   - Atlas: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/todo?retryWrites=true&w=majority`

3. (Optional) Load sample tasks:

   ```bash
   npm run seed
   ```

4. Start the API and the UI together:

   ```bash
   npm run dev
   ```

   - UI: http://localhost:5173
   - API: http://localhost:4000/api/health should return `{"status":"ok"}`

You can also run the two apps in separate terminals: `npm run dev` inside `server/`,
and `npm run dev` inside `client/`. In development, Vite forwards `/api` requests to
`http://localhost:4000`, so the client needs no extra configuration.

### Useful scripts (run from `todo-app/`)

| Command | What it does |
| --- | --- |
| `npm install` | Installs root, server and client dependencies |
| `npm run dev` | API (needs `server/.env`) + UI with live reload |
| `npm run dev:memory` | Same, but with an in-memory MongoDB and sample data |
| `npm run seed` | Inserts sample tasks into the database from `MONGODB_URI` (add `-- --reset` inside `server/` to wipe first) |
| `npm run build` | Production build of the client into `client/dist` |

---

## Environment variables

**server/.env**

| Name | Required | Example | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | yes | `mongodb://127.0.0.1:27017/todo` | MongoDB 5.0+ |
| `PORT` | no | `4000` | Default 4000 |
| `CLIENT_ORIGIN` | no | `https://my-todo.netlify.app` | Comma-separated origins allowed by CORS. If empty, any origin is allowed |

**client/.env** (production builds only)

| Name | Example | Notes |
| --- | --- | --- |
| `VITE_API_URL` | `https://todo-api.onrender.com` | Base URL of the deployed API, no trailing slash. Leave empty locally |

---

## API reference

Base URL: `http://localhost:4000/api`. Successful responses are `{ "data": ... }`;
errors are `{ "error": { "message", "details?" } }` with an HTTP 4xx/5xx status.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/tasks` | List tasks sorted by date. Query: `search` (keywords, title or description), `from` / `to` (ISO dates, `from` inclusive, `to` exclusive), `status` (`In Progress` or `Completed`), `limit` |
| `GET` | `/tasks/weeks?tz=Asia/Kolkata` | Weekly summary: `[{ weekStart, weekEnd, total, open, completed }]`, weeks Monday–Sunday in `tz` |
| `GET` | `/tasks/:id` | One task |
| `POST` | `/tasks` | Create. Body: `{ title*, dueDate*, description?, endDate?, priority?, status? }` |
| `PATCH` | `/tasks/:id` | Update any subset of the fields above (for example `{ "status": "Completed" }`). Send `null` to clear `priority` or `endDate` |
| `DELETE` | `/tasks/:id` | Delete (204) |

Task shape:

```json
{
  "_id": "6650f0c2a1b2c3d4e5f60718",
  "title": "Doing Homework",
  "description": "Maths exercises 4.1 – 4.6",
  "dueDate": "2026-11-05T13:30:00.000Z",
  "endDate": "2026-11-05T15:00:00.000Z",
  "priority": "Medium",
  "status": "In Progress",
  "createdAt": "...",
  "updatedAt": "..."
}
```

Validation: title is required (120 characters max), `dueDate` is a required valid
date, `endDate` must be after `dueDate`, priority is `Low`, `Medium` or `High`, and
status is `In Progress` or `Completed`. Unknown fields such as `_id` and `createdAt`
are ignored.

---

## Deployment (GitHub + Render + Netlify)

The assignment asks for a GitHub repository and a deployed solution using your own
API. One free setup:

### 1. Push to GitHub

Create an empty repository on GitHub, then run these from `todo-app/`:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "To-Do List app (MERN)"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
```

```bash
git push -u origin main
```

`.gitignore` already excludes `node_modules`, `dist` and `.env` files.

### 2. Database: MongoDB Atlas (free M0)

1. Create a cluster, then a **database user** (username and password).
2. Under **Network Access**, add `0.0.0.0/0`. Render's free tier has no fixed IP.
3. Click **Connect → Drivers** and copy the connection string. Add the database name:
   `...mongodb.net/todo?retryWrites=true&w=majority`.

### 3. API: Render (free web service)

1. On https://render.com, choose **New → Blueprint** and pick your repository. It
   reads `render.yaml`.
   Or choose **New → Web Service** and set: Root Directory `server`, Build Command
   `npm ci --omit=dev`, Start Command `npm start`.
2. Set the environment variable `MONGODB_URI` to your Atlas string.
3. Deploy, then open `https://<your-service>.onrender.com/api/health`. It should
   return `{"status":"ok"}`.
4. (Optional) Load demo data from your own machine: put the Atlas string in
   `server/.env`, then run `npm run seed`.

### 4. Front end: Netlify

1. On https://app.netlify.com, choose **Add new site → Import an existing project**
   and pick the repository. `netlify.toml` sets base `client`, command
   `npm run build` and publish directory `dist`.
2. Under **Site configuration → Environment variables**, add
   `VITE_API_URL = https://<your-service>.onrender.com`.
3. Deploy (or **Trigger deploy** if you added the variable after the first build).

### 5. Lock down CORS

Back on Render, set `CLIENT_ORIGIN = https://<your-site>.netlify.app` and redeploy.
Only your front end can then call the API from a browser.

> Render's free services sleep after about 15 minutes without traffic. The first
> request after that can take up to a minute while the API wakes up.

---

## Design decisions and assumptions

- **Open = In Progress.** A task is either *In Progress* (open) or *Completed*.
  New tasks start as In Progress.
- **Date & time** is stored as one UTC timestamp (`dueDate`). The Figma "Ends" field
  is an optional `endDate` on the same day, and must be after the start.
- **Weeks run Monday to Sunday** in the viewer's time zone. The server does the
  grouping with `$dateTrunc` / `$dateAdd`, so counts stay correct at scale and across
  DST.
- **Search** matches every keyword against title or description, case-insensitively,
  with regex characters escaped.
- **Single user, no login.** The brief has no accounts. Adding JWT auth and an
  `owner` field on tasks would be the next step for a multi-user deployment.
- **Swipe to delete** follows the brief's user flow and works with touch or a mouse
  drag. The always-visible trash icon (from the Figma) offers the same action for
  keyboard and mouse users, with a confirmation step.
- Accessibility: real buttons with labels, `role="checkbox"` for completion,
  dialogs with focus handling and Escape to close, live region for toasts, and
  reduced-motion support.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `MONGODB_URI is not set` | Create `server/.env` (step 4b) or use `npm run dev:memory` |
| `Could not connect to MongoDB` | Check MongoDB is running or the Atlas string is right, and that your IP (or `0.0.0.0/0`) is allowed in Atlas Network Access |
| Port 4000 or 5173 already in use | Stop the other process, or set `PORT=4001` in `server/.env` and `VITE_PROXY_TARGET=http://localhost:4001` in `client/.env` |
| Deployed site says "Cannot reach the server" | Check `VITE_API_URL` on Netlify (rebuild after changing it), check that `CLIENT_ORIGIN` on Render matches your Netlify URL exactly, and allow time for a sleeping Render service to wake |
| Refreshing a page on Netlify gives 404 | `netlify.toml` / `client/public/_redirects` handle this. Make sure the site's base directory is `client` |
| `dev:memory` is slow the first time | It is downloading MongoDB once. Later runs start in seconds |
