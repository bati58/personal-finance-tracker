import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Snackbar,
  Alert
} from '@mui/material';
import api, { setAuthToken } from '../api';

const AuthForm = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const handleModeChange = (_, value) => {
    if (value) setMode(value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload =
        mode === 'register'
          ? { name: form.name, email: form.email, password: form.password }
          : { email: form.email, password: form.password };

      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const response = await api.post(endpoint, payload);
      const { token, user } = response.data;

      localStorage.setItem('auth_token', token);
      setAuthToken(token);
      onAuthSuccess(user);
    } catch (error) {
      setSnackbar({
        open: true,
        message: getErrorMessage(error, 'Authentication failed.'),
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 420 }}>
        <Typography variant="h5" gutterBottom>
          {mode === 'register' ? 'Create an account' : 'Sign in'}
        </Typography>

        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="login">Login</ToggleButton>
          <ToggleButton value="register">Register</ToggleButton>
        </ToggleButtonGroup>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {mode === 'register' ? (
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          ) : null}

          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait...' : mode === 'register' ? 'Register' : 'Login'}
          </Button>
        </Box>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuthForm;
