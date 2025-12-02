// frontend/src/App.tsx
import React, { useState } from 'react';
import { Container, Typography, CssBaseline, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import WeeklyReport from './components/WeeklyReport';

// Define a simple custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Deep Green
    },
    secondary: {
      main: '#fbc02d', // Amber
    },
  },
});

function App() {
  // State to trigger refresh across components
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionAdded = () => {
    // Increment the key to force TransactionList and WeeklyReport to re-fetch data
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          💰 Personal Finance Tracker
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Left Column: Transaction Form */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.333%' } }}>
              <TransactionForm onTransactionAdded={handleTransactionAdded} />
            </Box>
            
            {/* Right Column: Weekly Report */}
            <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66.666%' } }}>
              <WeeklyReport refreshKey={refreshKey} />
            </Box>
          </Box>

          {/* Full Width: Transaction List */}
          <Box>
            <TransactionList refreshKey={refreshKey} />
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;