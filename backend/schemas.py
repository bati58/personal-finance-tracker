# backend/schemas.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal, List

# Transaction Schemas
class TransactionCreate(BaseModel):
    # Field to ensure the type is strictly 'credit' or 'debit'
    type: Literal['credit', 'debit']
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1)
    # Allows date to be passed as a string/datetime object
    date: datetime

class TransactionResponse(TransactionCreate):
    id: int

    class Config:
        # Allows conversion from ORM model to Pydantic
        from_attributes = True

# Report Schemas
class WeeklyReport(BaseModel):
    week_start: str # Formatted date string (e.g., "2025-11-25")
    total_credit: float
    total_debit: float
    net_flow: float

