# Personal Finance Tracker

A full-stack personal finance tracking application with React frontend and FastAPI backend.

## Features

- Add financial transactions (credit/debit)
- View transaction history with filtering
- Weekly financial reports with charts
- Responsive Material-UI design

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Activate virtual environment (if using):
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- `http://localhost:8000`
- `http://0.0.0.0:8000` (accessible from network)
- API docs: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the frontend:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Running on Local Network

To access the app from other devices on your local network:

### Step 1: Find Your Local IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Linux/Mac:**
```bash
ifconfig
# or
ip addr show
```

### Step 2: Update Frontend Configuration

Edit `frontend/src/config.ts`:

```typescript
// Option 1: Use environment variable
// Create .env file in frontend/ with:
// REACT_APP_API_URL=http://192.168.1.100:8000

// Option 2: Hardcode in config.ts
const API_BASE_URL = 'http://192.168.1.100:8000';  // Replace with your IP
```

### Step 3: Update Backend CORS

Edit `backend/main.py` and add your local IP to the origins list:

```python
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.100:3000",  # Replace with your IP
]
```

### Step 4: Start Both Servers

**Backend:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
# Set environment variable (Windows PowerShell)
$env:REACT_APP_API_URL="http://192.168.1.100:8000"
npm start

# Or use .env file (create frontend/.env):
# REACT_APP_API_URL=http://192.168.1.100:8000
```

### Step 5: Access from Other Devices

On other devices on the same network, open:
- `http://YOUR_IP:3000` (e.g., `http://192.168.1.100:3000`)

## Environment Variables (Optional)

Create a `.env` file in the `frontend` directory:

```
REACT_APP_API_URL=http://localhost:8000
```

Or for network access:
```
REACT_APP_API_URL=http://192.168.137.142:8000
```

## Project Structure

```
personal-finance-app/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic schemas
│   ├── database.py     # Database configuration
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── config.ts    # API configuration
│   │   └── App.tsx      # Main app component
│   └── package.json     # Node dependencies
└── README.md
```

## Troubleshooting

### Backend not accessible from network
- Ensure backend is running with `--host 0.0.0.0`
- Check Windows Firewall settings
- Verify CORS origins include your network IP

### Frontend can't connect to backend
- Check that API_BASE_URL in `config.ts` matches backend address
- Verify backend is running on the correct port
- Check browser console for CORS errors

### Port already in use
- Change port in backend: `uvicorn main:app --port 8001`
- Update `config.ts` with new port
- Or kill the process using the port

