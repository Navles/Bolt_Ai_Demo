'use client';
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const data = [
  { month: 'Jan', estimated: 45000, actual: 42000, committed: 40000 },
  { month: 'Feb', estimated: 52000, actual: 48000, committed: 45000 },
  { month: 'Mar', estimated: 48000, actual: 51000, committed: 49000 },
  { month: 'Apr', estimated: 58000, actual: 55000, committed: 52000 },
  { month: 'May', estimated: 65000, actual: 62000, committed: 58000 },
  { month: 'Jun', estimated: 72000, actual: 68000, committed: 65000 },
];

export default function CostChart() {
  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom fontWeight={600}>
          Cost Trend Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Monthly comparison of estimated vs actual costs
        </Typography>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="estimated" 
              stroke="#1976d2" 
              strokeWidth={3}
              name="Estimated"
              dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#2e7d32" 
              strokeWidth={3}
              name="Actual"
              dot={{ fill: '#2e7d32', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="committed" 
              stroke="#ed6c02" 
              strokeWidth={3}
              name="Committed"
              dot={{ fill: '#ed6c02', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}