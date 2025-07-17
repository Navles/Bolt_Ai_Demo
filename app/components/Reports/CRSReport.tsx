'use client';
import React, { useState } from 'react';
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
  Alert,
  IconButton,
  Collapse,
} from '@mui/material';
import { 
  Download, 
  Print, 
  Share, 
  TrendingUp, 
  TrendingDown, 
  Refresh,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { useEstimation } from '../../context/EstimationContext';
import { useApp } from '../../context/AppContext';

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
  const { getCRSReportData, getProjectSummary, estimations, getEstimationsByProject } = useEstimation();
  const { currentProject, user } = useApp();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const reportData = getCRSReportData();
  const projectSummary = getProjectSummary();
  const projectEstimations = getEstimationsByProject(currentProject?.id || '');

  const totalEstimate = reportData.reduce((sum, item) => sum + (item.estimate || 0), 0);
  const totalCommitted = reportData.reduce((sum, item) => sum + (item.committed || 0), 0);
  const totalUncommitted = reportData.reduce((sum, item) => sum + (item.uncommitted || 0), 0);
  const totalActual = reportData.reduce((sum, item) => sum + (item.actual || 0), 0);
  const totalAnticipated = reportData.reduce((sum, item) => sum + (item.anticipated || 0), 0);
  const totalVariance = reportData.reduce((sum, item) => sum + (item.variance || 0), 0);
  const totalVariancePercent = totalEstimate > 0 ? ((totalVariance / totalEstimate) * 100) : 0;

  const approvedEstimations = estimations.filter(est => est.status === 'approved' || est.status === 'submitted');

  // Cost head mapping for getting items
  const COST_HEAD_MAPPING: Record<string, string> = {
    'OM01 - Material Cost': 'MATERIAL COST',
    'OM02 - Manpower Cost': 'MANPOWER COST',
    'OM03 - Subcontracting Cost': 'SUBCONTRACTING COST',
    'OM04 - Equipment Cost': 'EQUIPMENT COST',
    'OM05 - Transportation Cost': 'TRANSPORTATION COST',
    'OM06 - Miscellaneous Cost': 'MISCELLANEOUS COST',
  };

  // Get items for a specific cost head
  const getItemsForCostHead = (costHeadDisplay: string) => {
    const items: any[] = [];
    
    // Find the original cost head key
    const originalCostHead = Object.keys(COST_HEAD_MAPPING).find(
      key => COST_HEAD_MAPPING[key] === costHeadDisplay
    );

    if (originalCostHead) {
      // Get all approved/submitted estimations for current project
      const relevantEstimations = estimations.filter(
        est => est.projectId === (currentProject?.id || '') && 
               est.costHead === originalCostHead && 
               (est.status === 'approved' || est.status === 'submitted')
      );

      console.log(`Items for ${costHeadDisplay}:`, relevantEstimations); // Debug log

      // Collect all items from these estimations with proper structure
      relevantEstimations.forEach(estimation => {
        if (estimation.items && estimation.items.length > 0) {
          estimation.items.forEach(item => {
            items.push({
              id: item.id,
              productCode: item.productCode || 'CUSTOM',
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unitCost: item.unitCost,
              totalCost: item.totalCost,
              estimationId: estimation.id,
              vendor: estimation.vendor || 'N/A',
              category: estimation.category,
              estimatedBy: estimation.estimatedBy,
            });
          });
        }
      });
    }

    console.log(`Final items for ${costHeadDisplay}:`, items); // Debug log
    return items;
  };

  const toggleRowExpansion = (rowId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

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
                  <strong>Project:</strong> {currentProject?.name || 'No Project Selected'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Project Code:</strong> {currentProject?.code || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Contract Value:</strong> ₹{currentProject?.contractValue?.toLocaleString() || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Report Date:</strong> {new Date().toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Period:</strong> {new Date().toLocaleDateString()} - Current
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong> <Chip label={currentProject?.status || 'Unknown'} color="success" size="small" />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Generated By:</strong> {user?.name || 'System'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Total Estimations:</strong> {approvedEstimations.length}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<Refresh />} size="small">
              Refresh
            </Button>
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

        {reportData.length === 0 ? (
          <Alert severity="info" sx={{ mb: 4 }}>
            No estimation data available. Please create cost estimations first to generate the CRS report.
            Go to the "Cost Estimation" tab to add estimations.
          </Alert>
        ) : (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              This report is automatically updated based on your cost estimations. 
              Data reflects {approvedEstimations.length} approved/submitted estimation(s).
              Click the arrow icons to view detailed items for each cost category.
            </Alert>

            <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 3 }}>
              <Table size="small" sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 700, minWidth: 50 }}>
                      {/* Expand/Collapse column */}
                    </TableCell>
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
                  {reportData.map((row, index) => {
                    const items = getItemsForCostHead(row.particulars);
                    const hasItems = items.length > 0;
                    const isExpanded = expandedRows.has(row.slNo);
                    
                    return (
                      <React.Fragment key={row.slNo}>
                        {/* Main Row */}
                        <TableRow 
                          hover
                          sx={{ 
                            '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                            '&:hover': { bgcolor: 'action.selected' }
                          }}
                        >
                          <TableCell>
                            {hasItems && (
                              <IconButton
                                size="small"
                                onClick={() => toggleRowExpansion(row.slNo)}
                                sx={{ color: 'primary.main' }}
                              >
                                {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                              </IconButton>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {row.slNo}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.particulars}
                            {hasItems && (
                              <Chip 
                                label={`${items.length} items`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
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

                        {/* Expanded Items Row */}
                        {hasItems && (
                          <TableRow>
                            <TableCell colSpan={10} sx={{ p: 0, border: 'none' }}>
                              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Detailed Items for {row.particulars}:
                                  </Typography>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Item Description</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Unit</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Unit Cost (₹)</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Total Cost (₹)</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Vendor</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>Estimated By</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {items.map((item, itemIndex) => (
                                        <TableRow key={`${item.id}-${itemIndex}`} hover>
                                          <TableCell sx={{ fontWeight: 500 }}>
                                            {item.description}
                                          </TableCell>
                                          <TableCell>{item.quantity}</TableCell>
                                          <TableCell>{item.unit}</TableCell>
                                          <TableCell sx={{ fontFamily: 'monospace' }}>
                                            ₹{item.unitCost.toLocaleString()}
                                          </TableCell>
                                          <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            ₹{item.totalCost.toLocaleString()}
                                          </TableCell>
                                          <TableCell>
                                            {item.vendor || '-'}
                                          </TableCell>
                                          <TableCell>
                                            <Chip 
                                              label={item.category} 
                                              size="small" 
                                              color="secondary" 
                                              variant="outlined"
                                            />
                                          </TableCell>
                                          <TableCell>{item.estimatedBy}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                  
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
                    <TableCell sx={{ color: 'white !important' }}></TableCell>
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
                      ₹{((currentProject?.contractValue || 0) / 100000).toFixed(1)}L
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600}>
                      Total Estimate
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      ₹{(totalEstimate / 1000).toFixed(1)}K
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
          </>
        )}

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
              <strong>Prepared By:</strong> {user?.name || 'System'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Last Updated:</strong> {new Date().toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Data Source:</strong> Live estimation data
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Next Review:</strong> {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </Typography>
            <Chip 
              label={Math.abs(totalVariancePercent) > 5 ? "Requires Attention" : "On Track"} 
              color={Math.abs(totalVariancePercent) > 5 ? "warning" : "success"} 
              size="small"
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}