import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../api';

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

const defaultFilters = {
  type: 'all',
  category: '',
  search: '',
  startDate: '',
  endDate: ''
};

const TransactionList = ({ refreshKey, onTransactionChanged }) => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    type: 'debit',
    amount: '',
    category: '',
    date: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const getErrorMessage = (error, fallback) => {
    const apiError = error?.response?.data?.error;
    return (
      apiError?.message ||
      apiError ||
      error?.response?.data?.detail ||
      error?.message ||
      fallback
    );
  };

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const buildQuery = (currentFilters) => {
    const params = new URLSearchParams();
    if (currentFilters.type && currentFilters.type !== 'all') {
      params.set('type', currentFilters.type);
    }
    if (currentFilters.category.trim()) {
      params.set('category', currentFilters.category.trim());
    }
    if (currentFilters.search.trim()) {
      params.set('q', currentFilters.search.trim());
    }
    if (currentFilters.startDate) {
      params.set('start_date', new Date(`${currentFilters.startDate}T00:00:00`).toISOString());
    }
    if (currentFilters.endDate) {
      params.set('end_date', new Date(`${currentFilters.endDate}T23:59:59.999`).toISOString());
    }
    const query = params.toString();
    return query ? `?${query}` : '';
  };

  const fetchTransactions = async (currentFilters) => {
    try {
      setIsLoading(true);
      setError('');
      const query = buildQuery(currentFilters);
      const url = `/transactions${query}`;
      const response = await api.get(url);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(appliedFilters);
  }, [appliedFilters, refreshKey]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    if (filters.startDate && filters.endDate && filters.endDate < filters.startDate) {
      showMessage('End date must be on or after start date.', 'error');
      return;
    }
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const openEdit = (tx) => {
    setEditId(tx.id);
    setEditForm({
      type: tx.type,
      amount: String(tx.amount ?? ''),
      category: tx.category || '',
      date: toDateTimeLocal(tx.date)
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditId(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async () => {
    if (!editId) return;
    setIsSaving(true);
    try {
      const payload = {
        type: editForm.type,
        amount: Number(editForm.amount),
        category: editForm.category,
        date: editForm.date ? new Date(editForm.date).toISOString() : undefined
      };
      await api.put(`/transactions/${editId}`, payload);
      showMessage('Transaction updated successfully.');
      closeEdit();
      fetchTransactions(filterType);
      if (onTransactionChanged) onTransactionChanged();
    } catch (error) {
      console.error('Error updating transaction:', error);
      showMessage(getErrorMessage(error, 'Failed to update transaction.'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openDelete = (tx) => {
    setDeleteTarget(tx);
  };

  const closeDelete = () => {
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/transactions/${deleteTarget.id}`);
      showMessage('Transaction deleted.');
      closeDelete();
      fetchTransactions(filterType);
      if (onTransactionChanged) onTransactionChanged();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showMessage(getErrorMessage(error, 'Failed to delete transaction.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Transaction History
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(5, minmax(0, 1fr))' },
          gap: 2,
          mb: 2
        }}
      >
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            label="Type"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="credit">Credit (Income)</MenuItem>
            <MenuItem value="debit">Debit (Expense)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Category (Exact)"
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
        />

        <TextField
          label="Search"
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          placeholder="e.g. groc"
        />

        <TextField
          label="Start Date"
          name="startDate"
          type="date"
          value={filters.startDate}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="End Date"
          name="endDate"
          type="date"
          value={filters.endDate}
          onChange={handleFilterChange}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button variant="contained" onClick={applyFilters}>
          Apply Filters
        </Button>
        <Button variant="outlined" onClick={clearFilters}>
          Clear
        </Button>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount ($)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2">Loading transactions...</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No transactions yet.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                  <TableCell style={{ color: tx.type === 'credit' ? 'green' : 'red' }}>
                    {tx.type.toUpperCase()}
                  </TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell align="right">{Number(tx.amount).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => openEdit(tx)} size="small">
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => openDelete(tx)} size="small" color="error">
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={isEditOpen} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle>Edit Transaction</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={editForm.type}
              onChange={handleEditChange}
              label="Type"
              disabled={isSaving}
            >
              <MenuItem value="credit">Credit (Income)</MenuItem>
              <MenuItem value="debit">Debit (Expense)</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={editForm.amount}
            onChange={handleEditChange}
            required
            inputProps={{ step: '0.01' }}
            disabled={isSaving}
          />

          <TextField
            label="Category"
            name="category"
            type="text"
            value={editForm.category}
            onChange={handleEditChange}
            required
            disabled={isSaving}
          />

          <TextField
            label="Date"
            name="date"
            type="datetime-local"
            value={editForm.date}
            onChange={handleEditChange}
            InputLabelProps={{ shrink: true }}
            required
            disabled={isSaving}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeEdit} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={saveEdit} variant="contained" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={closeDelete}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this transaction?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default TransactionList;
