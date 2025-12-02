// frontend/src/components/TransactionForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { 
  Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography
} from '@mui/material';
import { ITransactionCreate } from '../types';
import API_BASE_URL from '../config';

interface TransactionFormProps {
  onTransactionAdded: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState<ITransactionCreate>({
    amount: 0,
    type: 'debit',
    category: '',
    // Initialize date to current time in ISO format for backend
    date: new Date().toISOString(), 
  });
  
  // Local state for the datetime-local input (needs YYYY-MM-DDTHH:mm format)
  const [dateInput, setDateInput] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert dateInput (YYYY-MM-DDTHH:mm) to ISO string for backend
      const dateToSend = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();
      
      const payload = {
        ...formData,
        date: dateToSend
      };
      
      // API base URL from config
      await axios.post(`${API_BASE_URL}/transactions/`, payload);
      alert('Transaction added successfully!');
      
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const newDateInput = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      setFormData({ 
        amount: 0, 
        type: 'debit', 
        category: '', 
        date: now.toISOString() 
      });
      setDateInput(newDateInput);
      onTransactionAdded(); // Notify parent to refresh list/report
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to add transaction.';
      alert(`Failed to add transaction: ${errorMsg}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'date') {
      setDateInput(value);
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: name === 'amount' ? parseFloat(value as string) : value 
      }));
    }
  };

  const handleSelectChange = (e: { target: { name?: string; value: unknown } }) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value 
      }));
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h6">Add New Transaction</Typography>

      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>
        <Select
          name="type"
          value={formData.type}
          onChange={(e) => handleSelectChange({ target: { name: 'type', value: e.target.value } })}
          label="Type"
        >
          <MenuItem value="credit">Credit (Income)</MenuItem>
          <MenuItem value="debit">Debit (Expense)</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Amount"
        name="amount"
        type="number"
        value={formData.amount || ''}
        onChange={handleChange}
        required
        inputProps={{ step: "0.01" }}
      />
      
      <TextField
        label="Category"
        name="category"
        type="text"
        value={formData.category}
        onChange={handleChange}
        required
      />

      <TextField
        label="Date"
        name="date"
        type="datetime-local"
        value={dateInput}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        required
      />

      <Button type="submit" variant="contained" color="primary">
        Save Transaction
      </Button>
    </Box>
  );
};

export default TransactionForm;