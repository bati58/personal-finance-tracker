import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography
} from '@mui/material';
import API_BASE_URL from '../config';

const TransactionForm = ({ onTransactionAdded }) => {
  const [formData, setFormData] = useState({
    amount: 0,
    type: 'debit',
    category: '',
    date: new Date().toISOString()
  });

  const [dateInput, setDateInput] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dateToSend = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();

      const payload = {
        ...formData,
        amount: Number(formData.amount),
        date: dateToSend
      };

      await axios.post(`${API_BASE_URL}/transactions`, payload);
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
      onTransactionAdded();
    } catch (error) {
      console.error('Error adding transaction:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message || 'Failed to add transaction.';
      alert(`Failed to add transaction: ${errorMsg}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date') {
      setDateInput(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'amount' ? Number(value) : value
      }));
    }
  };

  const handleSelectChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      type: e.target.value
    }));
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        border: '1px solid #ccc',
        borderRadius: 2
      }}
    >
      <Typography variant="h6">Add New Transaction</Typography>

      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>
        <Select name="type" value={formData.type} onChange={handleSelectChange} label="Type">
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
        inputProps={{ step: '0.01' }}
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
