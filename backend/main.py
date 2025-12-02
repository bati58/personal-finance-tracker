# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract, and_
from datetime import datetime, timedelta, date
from typing import List, Literal

import models
import schemas
from database import get_db, init_db

app = FastAPI()

# --- CORS Middleware ---
# Allows frontend to communicate with backend
# Add your local network IP here if accessing from other devices
# Example: "http://192.168.137.142:3000" (replace with your IP)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.137.142:3000",  # Local network IP - update with your IP
    # Add more origins as needed, e.g., "http://192.168.1.100:3000"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# --- Startup Event ---
@app.on_event("startup")
async def on_startup():
    await init_db()

# --- Endpoint Dependencies ---
DbDependency = Depends(get_db)

# --- Transaction Endpoints ---

@app.post("/transactions/", response_model=schemas.TransactionResponse, status_code=201)
async def create_transaction(
    transaction: schemas.TransactionCreate,
    db: AsyncSession = DbDependency
):
    """Creates a new financial transaction."""
    db_transaction = models.Transaction(**transaction.model_dump())
    db.add(db_transaction)
    await db.commit()
    await db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions/", response_model=List[schemas.TransactionResponse])
async def read_transactions(
    db: AsyncSession = DbDependency,
    type: Literal['credit', 'debit'] | None = None
):
    """Retrieves a list of all transactions, optionally filtered by type."""
    stmt = select(models.Transaction).order_by(models.Transaction.date.desc())
    
    if type:
        stmt = stmt.where(models.Transaction.type == type)

    result = await db.execute(stmt)
    transactions = result.scalars().all()
    return transactions

# --- Report Endpoint ---

def get_monday(d: date) -> date:
    """Helper to get the date of the previous Monday."""
    return d - timedelta(days=d.weekday())

@app.get("/report/weekly/", response_model=List[schemas.WeeklyReport])
async def get_weekly_report(db: AsyncSession = DbDependency):
    """Generates a financial report grouped by week (Monday start)."""
    
    today = date.today()
    start_date = get_monday(today - timedelta(weeks=7)) # Report for last 8 weeks
    
    # 1. Fetch all relevant transactions
    stmt = select(models.Transaction).where(models.Transaction.date >= start_date)
    result = await db.execute(stmt)
    transactions = result.scalars().all()

    # 2. Group transactions by week start date
    weekly_data = {}

    for tx in transactions:
        tx_date = tx.date.date()
        # Ensure correct week start for aggregation
        week_start_date = get_monday(tx_date)
        week_start_str = week_start_date.strftime("%Y-%m-%d")

        if week_start_str not in weekly_data:
            weekly_data[week_start_str] = {
                "total_credit": 0.0,
                "total_debit": 0.0,
                "net_flow": 0.0,
            }

        data = weekly_data[week_start_str]
        
        if tx.type == 'credit':
            data["total_credit"] += tx.amount
        elif tx.type == 'debit':
            data["total_debit"] += tx.amount
    
    # 3. Calculate net flow for each week and format the result
    report_list = []
    current_week_start = start_date
    
    while current_week_start <= get_monday(today):
        week_start_str = current_week_start.strftime("%Y-%m-%d")
        data = weekly_data.get(week_start_str, {"total_credit": 0.0, "total_debit": 0.0})
        
        report_list.append(schemas.WeeklyReport(
            week_start=week_start_str,
            total_credit=round(data["total_credit"], 2),
            total_debit=round(data["total_debit"], 2),
            net_flow=round(data["total_credit"] - data["total_debit"], 2),
        ))
        current_week_start += timedelta(weeks=1)

    return report_list

# --- Run Command ---
# To run this, save it as main.py in the backend folder and run:
# uvicorn main:app --reload

