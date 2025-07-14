'use client';
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import { TrendingUp, TrendingDown, MoreVert } from '@mui/icons-material';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'primary' 
}: StatsCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 1 }}>
              {value}
            </Typography>
            
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isPositive ? (
                  <TrendingUp fontSize="small" color="success" />
                ) : (
                  <TrendingDown fontSize="small" color="error" />
                )}
                <Typography 
                  variant="body2" 
                  color={isPositive ? 'success.main' : 'error.main'}
                  fontWeight={600}
                >
                  {Math.abs(change)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  vs last month
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <IconButton size="small">
              <MoreVert fontSize="small" />
            </IconButton>
            {icon && (
              <Box 
                sx={{ 
                  p: 1, 
                  borderRadius: 2, 
                  bgcolor: `${color}.main`,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {icon}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}