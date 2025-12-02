// frontend/src/types.ts

export interface ITransaction {
  id: number;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  // Use string for date to match ISO format from backend
  date: string;
}

export interface ITransactionCreate {
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  // Date in ISO format for FastAPI (e.g., 2025-12-01T10:00:00)
  date: string; 
}

export interface IWeeklyReport {
  week_start: string;
  total_credit: number;
  total_debit: number;
  net_flow: number;
}