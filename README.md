# Personal Finance Tracker

A full-stack personal finance tracking application using:
- Backend: Node.js + Express + MongoDB Atlas
- Frontend: React (Vite) + Material UI + Recharts

## What this project does
- Add financial transactions (credit/debit)
- View transaction history with filtering
- Weekly financial reports with charts

The original FastAPI/CRA version is preserved in:
- `backend_fastapi/`
- `frontend_cra/`

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

## API Endpoints
- `GET /health`
- `POST /transactions`
- `GET /transactions` (filters: `type`, `start_date`, `end_date`, `category`, `q`, `limit`, `offset`)
- `GET /transactions/:id`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`
- `GET /report/weekly`

## Notes
- Amounts are stored as integer cents for accuracy; the API accepts/returns dollars.
- If you access the frontend from another device, add its URL to `CORS_ORIGINS`.
