# To-Do List App (MERN)

## Prerequisites

- Node.js 20 or newer
- MongoDB (local or Atlas), optional if you use Option 1 below

## Setup

```bash
git clone https://github.com/Abhiraj-Shrivastava/todo-mern.git
cd todo-mern
npm install
```

`npm install` installs the dependencies for both `server` and `client`.

## Run

### Option 1: without MongoDB

```bash
npm run dev:memory
```

This uses a temporary in-memory database with sample tasks. Data resets when you stop it.

### Option 2: with MongoDB

1. Create `server/.env` from the example file:

   ```bash
   cp server/.env.example server/.env
   ```

   On Windows: `copy server\.env.example server\.env`

2. Set `MONGODB_URI` in `server/.env` to your MongoDB connection string.

3. Optionally, load sample tasks:

   ```bash
   npm run seed
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

Open http://localhost:5173. The API runs on http://localhost:4000.
