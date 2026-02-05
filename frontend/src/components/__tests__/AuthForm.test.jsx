import React from 'react';
import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import AuthForm from '../AuthForm';

test('renders login form', () => {
  render(<AuthForm onAuthSuccess={() => {}} />);
  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});
