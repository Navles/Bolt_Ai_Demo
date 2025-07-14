'use client';
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import { Download, Print, Share } from '@mui/icons-material';

const reportData = [
  {
    costHead: 'OM01',
    description: 'MATERIAL COST',
    estimatedCost: 125000,
    committedCost: 118000,
    actualCost: 122000,
    anticipatedFinalCost: 124000,
    variance: -1000,
    variancePercent: -0.8,
  },
  {
    costHead: 'OM02',
    description: 'MANPOWER COST',
    estimatedCost: 95000,
    committedCost: 87000,
    actualCost: 92000,
    anticipatedFinalCost: 98000,
    variance: 3000,
    variancePercent: 3.2,
  },
  {
    costHead: 'OM03',
    description: 'SUBCONTRACTING COST',
    estimatedCost: 75000,
    committedCost: 72000,
    actualCost: 74000,
    anticipatedFinalCost: 76000,
    variance: 1000,
    variancePercent: 1.3,
  },
  {
    costHead: 'OM04',
    description: 'EQUIPMENT COST',
    estimatedCost: 85000,
    committedCost: 82000,
    actualCost: 81000,
    anticipatedFinalCost: 84000,
    variance: -1000,
    variancePercent: -1.2,
  },
  {
    costHead: 'OM05',
    description: 'TRANSPORTATION COST',
    estimatedCost: 45000,
    committedCost: 42000,
    actualCost: 44000,
    anticipatedFinalCost: 46000,
    variance: 1000,
    variancePercent: 2.2,
  },
  {
    costHead: 'OM06',
    description: 'MISCELLANEOUS COST',
    estimatedCost: 25000,
    committedCost: 23000,
    actualCost: 24000,
    anticipatedFinalCost: 25500,
    variance: 500,
    variancePercent: 2.0,
  },
];

const formatCurrency = (amount: number) => {
  return `₹${amount.toLocaleString()}`;
};

const getVarianceColor = (variance: number) => {
  if (variance > 0) return 'error';
  if (variance < 0) return 'success';
  return 'default';
};

export default function CRSReport() {
  const totalEstimated = reportData.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalCommitted = reportData.reduce((sum, item) => sum + item.committedCost, 0);
  const totalActual = reportData.reduce((sum, item) => sum + item.actualCost, 0);
  const totalAnticipated = reportData.reduce((sum, item) => sum + item.anticipatedFinalCost, 0);
  const totalVariance = reportData.reduce((sum, item) => sum + item.variance, 0);
  const totalVariancePercent = ((totalVariance / totalEstimated) * 100);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" component="div" fontWeight={700}>
              Contract Review Sheet (CRS)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Project: Infrastructure Development - 10M193
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Report Date: {new Date().toLocaleDateString()}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Print />} size="small">
              Print
            </Button>
            <Button variant="outlined" startIcon={<Share />} size="small">
              Share
            </Button>
            <Button variant="contained" startIcon={<Download />} size="small">
              Export PDF
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Cost Head</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Estimated Cost</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Committed Cost</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Actual Cost</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Anticipated Final</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Variance</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">Variance %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((row) => (
                <TableRow key={row.costHead} hover>
                  <TableCell fontWeight={600}>{row.costHead}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell align="right">{formatCurrency(row.estimatedCost)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.committedCost)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.actualCost)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.anticipatedFinalCost)}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatCurrency(Math.abs(row.variance))}
                      color={getVarianceColor(row.variance)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      color={row.variancePercent > 0 ? 'error.main' : 'success.main'}
                      fontWeight={600}
                    >
                      {row.variancePercent > 0 ? '+' : ''}{row.variancePercent.toFixed(1)}%
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              
              <TableRow sx={{ bgcolor: 'background.default', '& td': { fontWeight: 700 } }}>
                <TableCell colSpan={2}>TOTAL</TableCell>
                <TableCell align="right">{formatCurrency(totalEstimated)}</TableCell>
                <TableCell align="right">{formatCurrency(totalCommitted)}</TableCell>
                <TableCell align="right">{formatCurrency(totalActual)}</TableCell>
                <TableCell align="right">{formatCurrency(totalAnticipated)}</TableCell>
                <TableCell align="right">
                  <Chip
                    label={formatCurrency(Math.abs(totalVariance))}
                    color={getVarianceColor(totalVariance)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    color={totalVariancePercent > 0 ? 'error.main' : 'success.main'}
                    fontWeight={700}
                  >
                    {totalVariancePercent > 0 ? '+' : ''}{totalVariancePercent.toFixed(1)}%
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Contract Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contract Value: ₹8,50,000
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Net Margin: ₹2,50,000 (29.4%)
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Project Status
            </Typography>
            <Chip label="On Track" color="success" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}