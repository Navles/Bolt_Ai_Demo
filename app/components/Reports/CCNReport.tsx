'use client';
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Schedule,
  Cancel,
} from '@mui/icons-material';
import { useCostChangeNote } from '../../context/CostChangeNoteContext';
import { useApp } from '../../context/AppContext';

export default function CCNReport() {
  const { getCCNsByProject, getCCNSummary, getCCNImpactOnBudget } = useCostChangeNote();
  const { currentProject } = useApp();

  const projectCCNs = getCCNsByProject(currentProject?.id || '');
  const summary = getCCNSummary();
  const budgetImpact = getCCNImpactOnBudget(currentProject?.id || '');

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle color="success" />;
      case 'rejected': return <Cancel color="error" />;
      case 'submitted': 
      case 'under_review': return <Schedule color="warning" />;
      default: return <Warning color="action" />;
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <TrendingUp color="error" />;
      case 'decrease': return <TrendingDown color="success" />;
      case 'scope_change': return <Warning color="warning" />;
      default: return <Warning />;
    }
  };

  if (projectCCNs.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom fontWeight={600}>
            Cost Change Note Report
          </Typography>
          <Alert severity="info">
            No Cost Change Notes found for this project. CCN reports will appear here once cost changes are created.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600}>Total CCNs</Typography>
              <Typography variant="h3" fontWeight={700}>{summary.totalCCNs}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600}>Pending Approval</Typography>
              <Typography variant="h3" fontWeight={700}>{summary.pendingApproval}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600}>Approved</Typography>
              <Typography variant="h3" fontWeight={700}>{summary.approved}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: summary.totalVariance > 0 ? 'error.main' : 'success.main', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={600}>Net Variance</Typography>
              <Typography variant="h3" fontWeight={700}>
                {summary.totalVariance > 0 ? '+' : ''}{formatCurrency(summary.totalVariance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Budget Impact */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom fontWeight={600}>
            Budget Impact Analysis
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Original Budget</Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formatCurrency(budgetImpact.originalBudget)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Revised Budget</Typography>
                <Typography variant="h5" fontWeight={600}>
                  {formatCurrency(budgetImpact.revisedBudget)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ 
                textAlign: 'center', 
                p: 2, 
                bgcolor: budgetImpact.totalVariance > 0 ? 'error.light' : 'success.light', 
                borderRadius: 2 
              }}>
                <Typography variant="subtitle2" color="text.secondary">Total Impact</Typography>
                <Typography variant="h5" fontWeight={600}>
                  {budgetImpact.totalVariance > 0 ? '+' : ''}{formatCurrency(budgetImpact.totalVariance)}
                </Typography>
                <Typography variant="body2">
                  ({budgetImpact.variancePercent > 0 ? '+' : ''}{budgetImpact.variancePercent.toFixed(2)}%)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* CCN Details Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom fontWeight={600}>
            Cost Change Notes Details
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>CCN Number</TableCell>
                  <TableCell>Change Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Original Cost</TableCell>
                  <TableCell>Revised Cost</TableCell>
                  <TableCell>Variance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Urgency</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Initiated By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projectCCNs.map((ccn) => (
                  <TableRow key={ccn.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {ccn.ccnNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getChangeTypeIcon(ccn.changeType)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {ccn.changeType.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ccn.category.charAt(0).toUpperCase() + ccn.category.slice(1)} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(ccn.totalOriginalCost)}</TableCell>
                    <TableCell>{formatCurrency(ccn.totalRevisedCost)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {ccn.totalVariance > 0 ? (
                          <TrendingUp color="error" fontSize="small" />
                        ) : (
                          <TrendingDown color="success" fontSize="small" />
                        )}
                        <Typography 
                          color={ccn.totalVariance > 0 ? 'error.main' : 'success.main'}
                          fontWeight={600}
                        >
                          {ccn.totalVariance > 0 ? '+' : ''}{formatCurrency(ccn.totalVariance)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(ccn.status)}
                        <Chip 
                          label={ccn.status.replace('_', ' ').toUpperCase()} 
                          size="small"
                          color={
                            ccn.status === 'approved' ? 'success' :
                            ccn.status === 'rejected' ? 'error' :
                            ccn.status === 'submitted' || ccn.status === 'under_review' ? 'warning' :
                            'default'
                          }
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ccn.urgency.toUpperCase()} 
                        size="small"
                        color={
                          ccn.urgency === 'critical' || ccn.urgency === 'high' ? 'error' :
                          ccn.urgency === 'medium' ? 'warning' :
                          'success'
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(ccn.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ccn.initiatedBy}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom fontWeight={600}>
            Change Analysis Summary
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="error.dark">Total Cost Increases</Typography>
                <Typography variant="h5" fontWeight={600} color="error.dark">
                  +{formatCurrency(summary.totalIncrease)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="success.dark">Total Cost Decreases</Typography>
                <Typography variant="h5" fontWeight={600} color="success.dark">
                  -{formatCurrency(summary.totalDecrease)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Report Generated:</strong> {new Date().toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Project:</strong> {currentProject?.name} ({currentProject?.code})
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}