import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
import api from '../api';

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dateToSend = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString();

      const payload = {
        ...formData,
        amount: Number(formData.amount),
        date: dateToSend
      };

      await api.post('/transactions', payload);
      setSnackbar({
        open: true,
        message: 'Transaction added successfully.',
        severity: 'success'
      });

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
      const apiError = error.response?.data?.error;
      const errorMsg =
        apiError?.message ||
        apiError ||
        error.response?.data?.detail ||
        error.message ||
        'Failed to add transaction.';
      setSnackbar({
        open: true,
        message: `Failed to add transaction: ${errorMsg}`,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
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
        <Select
          name="type"
          value={formData.type}
          onChange={handleSelectChange}
          label="Type"
          disabled={isSubmitting}
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
        inputProps={{ step: '0.01' }}
        disabled={isSubmitting}
      />

      <TextField
        label="Category"
        name="category"
        type="text"
        value={formData.category}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      />

      <TextField
        label="Date"
        name="date"
        type="datetime-local"
        value={dateInput}
        onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        required
        disabled={isSubmitting}
      />

      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Transaction'}
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TransactionForm;
