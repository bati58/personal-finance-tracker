// frontend/src/components/WeeklyReport.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Typography, Box, Paper
} from '@mui/material';
import { IWeeklyReport } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import API_BASE_URL from '../config';

interface WeeklyReportProps {
  refreshKey: number;
}

const WeeklyReport: React.FC<WeeklyReportProps> = ({ refreshKey }) => {
  const [reportData, setReportData] = useState<IWeeklyReport[]>([]);

  const fetchReport = async () => {
    try {
      const response = await axios.get<IWeeklyReport[]>(`${API_BASE_URL}/report/weekly/`);
      setReportData(response.data);
    } catch (error: any) {
      console.error('Error fetching weekly report:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received. Is the backend server running?');
      }
    }
  };

  useEffect(() => {
    fetchReport();
  }, [refreshKey]);

  // Get the latest (current) week's data for the summary card
  const currentWeek = reportData[reportData.length - 1] || { total_credit: 0, total_debit: 0, net_flow: 0 };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Weekly Financial Report</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.333%' } }}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
            <Typography variant="subtitle1">Current Week Net Flow</Typography>
            <Typography variant="h4" sx={{ color: currentWeek.net_flow >= 0 ? 'green' : 'red' }}>
              ${currentWeek.net_flow.toFixed(2)}
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.333%' } }}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff8e1' }}>
            <Typography variant="subtitle1">Total Income</Typography>
            <Typography variant="h4" color="green">
              ${currentWeek.total_credit.toFixed(2)}
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33.333%' } }}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffebee' }}>
            <Typography variant="subtitle1">Total Expenses</Typography>
            <Typography variant="h4" color="red">
              ${currentWeek.total_debit.toFixed(2)}
            </Typography>
          </Paper>
        </Box>
      </Box>
      
      <Box height={400} sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Weekly Net Flow Trend</Typography>
        
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={reportData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="week_start" 
              // Custom tick formatter to display a shorter date
              tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`} 
              labelFormatter={(label) => `Week Start: ${label}`}
            />
            <Legend />
            {/* The main bar showing the Net Flow */}
            <Bar dataKey="net_flow" name="Net Flow" fill="#03a9f4" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default WeeklyReport;