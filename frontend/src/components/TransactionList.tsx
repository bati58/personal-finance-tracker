// frontend/src/components/TransactionList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Typography, Box, Select, MenuItem, FormControl, InputLabel 
} from '@mui/material';
import { ITransaction } from '../types';
import API_BASE_URL from '../config';

interface TransactionListProps {
  refreshKey: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ refreshKey }) => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');

  const fetchTransactions = async (type: 'all' | 'credit' | 'debit') => {
    try {
      const url = type === 'all' 
        ? `${API_BASE_URL}/transactions/` 
        : `${API_BASE_URL}/transactions/?type=${type}`;
      
      const response = await axios.get<ITransaction[]>(url);
      setTransactions(response.data);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received. Is the backend server running?');
      }
    }
  };

  useEffect(() => {
    fetchTransactions(filterType);
  }, [filterType, refreshKey]); // Re-fetch when filter changes or parent triggers refresh

  const handleFilterChange = (e: { target: { value: unknown; }; }) => {
    setFilterType(e.target.value as 'all' | 'credit' | 'debit');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Transaction History</Typography>
      
      <FormControl sx={{ minWidth: 150, mb: 2 }}>
        <InputLabel>Filter By Type</InputLabel>
        <Select
          value={filterType}
          onChange={handleFilterChange}
          label="Filter By Type"
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="credit">Credit (Income)</MenuItem>
          <MenuItem value="debit">Debit (Expense)</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount ($)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell style={{ color: tx.type === 'credit' ? 'green' : 'red' }}>
                  {tx.type.toUpperCase()}
                </TableCell>
                <TableCell>{tx.category}</TableCell>
                <TableCell align="right">
                  {tx.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TransactionList;