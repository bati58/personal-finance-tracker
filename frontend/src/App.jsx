import React, { useEffect, useState } from 'react';
import { Container, Typography, CssBaseline, Box, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import WeeklyReport from './components/WeeklyReport';
import AuthForm from './components/AuthForm';
import api, { setAuthToken } from './api';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32'
    },
    secondary: {
      main: '#fbc02d'
    }
  }
});

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const handleTransactionAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleTransactionChanged = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setAuthChecked(true);
      return;
    }

    api
      .get('/auth/me')
      .then((response) => {
        setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        setAuthToken(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  const handleAuthSuccess = (userInfo) => {
    setUser(userInfo);
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setAuthToken(null);
    setUser(null);
    setRefreshKey((prev) => prev + 1);
  };

  if (!authChecked) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {user ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button onClick={handleLogout}>Logout</Button>
          </Box>
        ) : null}
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          Personal Finance Tracker
        </Typography>

        {user ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.333%' } }}>
                <TransactionForm onTransactionAdded={handleTransactionAdded} />
              </Box>

              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66.666%' } }}>
                <WeeklyReport refreshKey={refreshKey} />
              </Box>
            </Box>

            <Box>
              <TransactionList
                refreshKey={refreshKey}
                onTransactionChanged={handleTransactionChanged}
              />
            </Box>
          </Box>
        ) : (
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
