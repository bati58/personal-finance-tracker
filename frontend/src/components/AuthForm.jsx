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

const validationModel = {
  login: {
    email: { label: 'Email', required: true, email: true },
    password: { label: 'Password', required: true, min: 8, max: 128 }
  },
  register: {
    name: {
      label: 'Name',
      required: true,
      min: 2,
      max: 64,
      pattern: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      patternMessage: 'Name must contain only letters and spaces.'
    },
    email: { label: 'Email', required: true, email: true },
    password: { label: 'Password', required: true, min: 8, max: 128 }
  }
};

const createErrorModel = () => ({
  name: '',
  email: '',
  password: '',
  form: ''
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeValue = (field, value) => (field === 'password' ? value : value.trim());

const validateField = (mode, field, value) => {
  const rules = validationModel[mode]?.[field];
  if (!rules) return '';

  const normalized = normalizeValue(field, value || '');
  if (rules.required && normalized.length === 0) {
    return `${rules.label} is required.`;
  }

  if (rules.min && normalized.length < rules.min) {
    return `${rules.label} must be at least ${rules.min} characters.`;
  }

  if (rules.max && normalized.length > rules.max) {
    return `${rules.label} must be at most ${rules.max} characters.`;
  }

  if (rules.email && !emailPattern.test(normalized)) {
    return 'Please enter a valid email address.';
  }

  if (rules.pattern && !rules.pattern.test(normalized)) {
    return rules.patternMessage || `${rules.label} is invalid.`;
  }

  return '';
};

const validateForm = (mode, values) => {
  const errors = createErrorModel();
  Object.keys(validationModel[mode]).forEach((field) => {
    errors[field] = validateField(mode, field, values[field]);
  });
  return errors;
};

const extractServerErrors = (error) => {
  const apiError = error?.response?.data?.error;
  const details = apiError?.details;
  const fieldErrors = details?.fieldErrors;

  if (!fieldErrors || typeof fieldErrors !== 'object') {
    return null;
  }

  const mapped = createErrorModel();
  Object.entries(fieldErrors).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages.length > 0) {
      mapped[field] = messages[0];
    }
  });
  mapped.form = apiError?.message || '';
  return mapped;
};

const AuthForm = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState(createErrorModel());
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  const handleModeChange = (_, value) => {
    if (value) {
      setMode(value);
      setErrors(createErrorModel());
      setTouched({ name: false, email: false, password: false });
      setHasSubmitted(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name] || hasSubmitted) {
      setErrors((prev) => ({ ...prev, [name]: validateField(mode, name, value), form: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(mode, name, value), form: '' }));
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
    setHasSubmitted(true);
    const validationErrors = validateForm(mode, form);
    const hasErrors = Object.keys(validationModel[mode]).some((field) => validationErrors[field]);
    if (hasErrors) {
      setErrors((prev) => ({ ...prev, ...validationErrors, form: '' }));
      return;
    }

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, form: '' }));
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
      const serverErrors = extractServerErrors(error);
      if (serverErrors) {
        setErrors((prev) => ({ ...prev, ...serverErrors }));
      }

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
              onBlur={handleBlur}
              required
              disabled={isSubmitting}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
          ) : null}

          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            disabled={isSubmitting}
            error={Boolean(errors.email)}
            helperText={errors.email}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            disabled={isSubmitting}
            error={Boolean(errors.password)}
            helperText={errors.password}
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
