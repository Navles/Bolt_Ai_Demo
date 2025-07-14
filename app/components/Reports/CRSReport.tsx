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
  Grid,
} from '@mui/material';
import { Download, Print, Share, TrendingUp, TrendingDown } from '@mui/icons-material';

const reportData = [
  {
    slNo: 'OM01',
    particulars: 'WORKING COST',
    estimate: 15000,
    committed: null,
    uncommitted: null,
    actual: 16000,
    anticipated: 16000,
    variance: 1000,
    variancePercent: 6.67,
  },
  {
    slNo: 'OM02',
    particulars: 'CONSTRUCTION BILL',
    estimate: null,
    committed: null,
    uncommitted: null,
    actual: null,
    anticipated: null,
    variance: null,
    variancePercent: null,
  },
  {
    slNo: 'OM03',
    particulars: 'POWER AND FUEL',
    estimate: null,
    committed: null,
    uncommitted: null,
    actual: 14,
    anticipated: 14,
    variance: null,
    variancePercent: null,
  },
  {
    slNo: 'OM04',
    particulars: 'STORES',
    estimate: null,
    committed: null,
    uncommitted: null,
    actual: 10,
    anticipated: 10,
    variance: null,
    variancePercent: null,
  },
  {
    slNo: 'OM05',
    particulars: 'TOTAL MATERIAL AND POWER COST STORES',
    estimate: 21000,
    committed: 4000,
    uncommitted: 16000,
    actual: 4100,
    anticipated: 16100,
    variance: 1100,
    variancePercent: 5.24,
  },
  {
    slNo: 'OM06',
    particulars: 'COST CENTRE',
    estimate: null,
    committed: null,
    uncommitted: null,
    actual: null,
    anticipated: null,
    variance: null,
    variancePercent: null,
  },
  {
    slNo: 'OM07',
    particulars: 'REPAIR AND MAINTENANCE',
    estimate: null,
    committed: null,
    uncommitted: null,
    actual: null,
    anticipated: null,
    variance: null,
    variancePercent: null,
  },
  {
    slNo: 'OM08',
    particulars: 'WAGES PERSONNEL AT SITE',
    estimate: 740,
    committed: null,
    uncommitted: 1200,
    actual: 310,
    anticipated: 1400,
    variance: 660,
    variancePercent: 89.19,
  },
  {
    slNo: 'OM09',
    particulars: 'TRANSPORT',
    estimate: 140,
    committed: 110,
    uncommitted: null,
    actual: 140,
    anticipated: 140,
    variance: 0,
    variancePercent: 0,
  },
  {
    slNo: 'OM10',
    particulars: 'OTHERS',
    estimate: null,
    committed: null,
    uncommitted: null,
    actual: null,
    anticipated: null,
    variance: null,
    variancePercent: null,
  },
  {
    slNo: 'OM11',
    particulars: 'SUB CONTRACT PERSONNEL',
    estimate: 26000,
    committed: 18000,
    uncommitted: 2000,
    anticipated: 27000,
    variance: 1000,
    variancePercent: 3.85,
  },
];

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return '-';
  return amount.toLocaleString();
};

const getVarianceColor = (variance: number | null) => {
  if (variance === null || variance === undefined) return 'default';
  if (variance > 0) return 'error';
  if (variance < 0) return 'success';
  return 'default';
};

const getVarianceIcon = (variance: number | null) => {
  if (variance === null || variance === undefined) return null;
  return variance > 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />;
};

export default function CRSReport() {
  const totalEstimate = reportData.reduce((sum, item) => sum + (item.estimate || 0), 0);
  const totalCommitted = reportData.reduce((sum, item) => sum + (item.committed || 0), 0);
  const totalUncommitted = reportData.reduce((sum, item) => sum + (item.uncommitted || 0), 0);
  const totalActual = reportData.reduce((sum, item) => sum + (item.actual || 0), 0);
  const totalAnticipated = reportData.reduce((sum, item) => sum + (item.anticipated || 0), 0);
  const totalVariance = reportData.reduce((sum, item) => sum + (item.variance || 0), 0);
  const totalVariancePercent = totalEstimate > 0 ? ((totalVariance / totalEstimate) * 100) : 0;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="div" fontWeight={700} gutterBottom>
              Contract Review Sheet (CRS)
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Project:</strong> Infrastructure Development - 10M193
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Contract Value:</strong> ₹8,50,000
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Report Date:</strong> {new Date().toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Period:</strong> April 2024 - June 2024
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong> <Chip label="Active" color="success" size="small" />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Generated By:</strong> John Smith
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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

        <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 3 }}>
          <Table size="small" sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700, minWidth: 80 }}>
                  Sl No.
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, minWidth: 300 }}>
                  Particulars
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, textAlign: 'right', minWidth: 120 }}>
                  Estimate<br />₹
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, textAlign: 'right', minWidth: 120 }}>
                  Committed<br />₹
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, textAlign: 'right', minWidth: 120 }}>
                  Uncommitted<br />₹
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, textAlign: 'right', minWidth: 120 }}>
                  Actual<br />₹
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, textAlign: 'right', minWidth: 120 }}>
                  Anticipated<br />Final Cost ₹
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, textAlign: 'right', minWidth: 120 }}>
                  Variance<br />₹
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, textAlign: 'right', minWidth: 100 }}>
                  Variance<br />%
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.map((row, index) => (
                <TableRow 
                  key={row.slNo} 
                  hover
                  sx={{ 
                    '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {row.slNo}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {row.particulars}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    {formatCurrency(row.estimate)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    {formatCurrency(row.committed)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    {formatCurrency(row.uncommitted)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    {formatCurrency(row.actual)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    {formatCurrency(row.anticipated)}
                  </TableCell>
                  <TableCell align="right">
                    {row.variance !== null && row.variance !== undefined ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {getVarianceIcon(row.variance)}
                        <Chip
                          label={formatCurrency(Math.abs(row.variance))}
                          color={getVarianceColor(row.variance)}
                          size="small"
                          sx={{ fontFamily: 'monospace', minWidth: 80 }}
                        />
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {row.variancePercent !== null && row.variancePercent !== undefined ? (
                      <Typography 
                        color={row.variancePercent > 0 ? 'error.main' : 'success.main'}
                        fontWeight={600}
                        sx={{ fontFamily: 'monospace' }}
                      >
                        {row.variancePercent > 0 ? '+' : ''}{row.variancePercent.toFixed(2)}%
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Total Row */}
              <TableRow sx={{ 
                bgcolor: 'primary.dark', 
                '& td': { 
                  fontWeight: 700, 
                  color: 'white',
                  borderTop: '2px solid',
                  borderColor: 'primary.main'
                } 
              }}>
                <TableCell sx={{ color: 'white !important' }}>TOTAL</TableCell>
                <TableCell sx={{ color: 'white !important' }}>GRAND TOTAL</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'white !important' }}>
                  {formatCurrency(totalEstimate)}
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'white !important' }}>
                  {formatCurrency(totalCommitted)}
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'white !important' }}>
                  {formatCurrency(totalUncommitted)}
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'white !important' }}>
                  {formatCurrency(totalActual)}
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'white !important' }}>
                  {formatCurrency(totalAnticipated)}
                </TableCell>
                <TableCell align="right" sx={{ color: 'white !important' }}>
                  <Chip
                    label={formatCurrency(Math.abs(totalVariance))}
                    color={totalVariance > 0 ? 'error' : 'success'}
                    size="small"
                    sx={{ 
                      fontFamily: 'monospace', 
                      minWidth: 80,
                      bgcolor: totalVariance > 0 ? 'error.light' : 'success.light',
                      color: 'white !important'
                    }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'white !important' }}>
                  {totalVariancePercent > 0 ? '+' : ''}{totalVariancePercent.toFixed(2)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 4 }} />

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  Contract Value
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  ₹8.50L
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  Total Committed
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  ₹{(totalCommitted / 1000).toFixed(1)}K
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  Total Actual
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  ₹{(totalActual / 1000).toFixed(1)}K
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ bgcolor: totalVariance > 0 ? 'error.main' : 'success.main', color: 'white' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600}>
                  Total Variance
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {totalVariance > 0 ? '+' : ''}₹{(totalVariance / 1000).toFixed(1)}K
                </Typography>
                <Typography variant="body2">
                  ({totalVariancePercent > 0 ? '+' : ''}{totalVariancePercent.toFixed(1)}%)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Footer Information */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: 2,
          bgcolor: 'background.default',
          borderRadius: 2
        }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Prepared By:</strong> Finance Department
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Approved By:</strong> Project Manager
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Next Review:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </Typography>
            <Chip 
              label={totalVariancePercent > 5 ? "Requires Attention" : "On Track"} 
              color={totalVariancePercent > 5 ? "warning" : "success"} 
              size="small"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}