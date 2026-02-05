# Personal Finance Tracker
![FinanceTracker](screenshot0.png)
![FinanceTracker](screenshot.png)


A full-stack personal finance tracking application using:
- Backend: Node.js + Express + MongoDB Atlas
- Frontend: React (Vite) + Material UI + Recharts

## What this project does
- Add financial transactions (credit/debit)
- View transaction history with filtering
- Weekly financial reports with charts

## Authentication
This version requires login. The frontend provides a simple login/register screen.

You can also use the API directly:
- `POST /auth/register` `{ name, email, password }`
- `POST /auth/login` `{ email, password }`
- `GET /auth/me` (requires `Authorization: Bearer <token>`)

## Backend setup (Node/Express)

1. Go to the backend folder:
```bash
cd backend
```

2. Create `.env` from the example and set your MongoDB Atlas URI:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

3. Edit `.env` and set:
```
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER/dbname?retryWrites=true&w=majority
CORS_ORIGINS=http://localhost:5173
PORT=8000
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
```

4. Install and run:
```bash
npm install
npm run dev
```

Backend will run at `http://localhost:8000`

## Frontend setup (Vite React)

1. Go to the frontend folder:
```bash
cd frontend
```

2. Create `.env` (optional) to point to your API:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

3. Install and run:
```bash
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`

## Testing
Backend tests:
```bash
cd backend
npm test
```

Frontend tests:
```bash
cd frontend
npm test
```

## API Endpoints
- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /transactions`
- `GET /transactions` (filters: `type`, `start_date`, `end_date`, `category`, `q`, `limit`, `offset`)
- `GET /transactions/:id`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`
- `GET /report/weekly`

## Notes
- Amounts are stored as integer cents for accuracy; the API accepts/returns dollars.
- If you access the frontend from another device, add its URL to `CORS_ORIGINS`.
