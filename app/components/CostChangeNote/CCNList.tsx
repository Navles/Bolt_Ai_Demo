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
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  MoreVert,
  CheckCircle,
  Cancel,
  TrendingUp,
  TrendingDown,
  Warning,
  Schedule,
  Assignment,
} from '@mui/icons-material';
import { useCostChangeNote } from '../../context/CostChangeNoteContext';
import { useApp } from '../../context/AppContext';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft': return 'default';
    case 'submitted': return 'info';
    case 'under_review': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'error';
    default: return 'default';
  }
};

const getChangeTypeIcon = (changeType: string) => {
  switch (changeType) {
    case 'increase': return <TrendingUp color="error" />;
    case 'decrease': return <TrendingDown color="success" />;
    case 'scope_change': return <Warning color="warning" />;
    default: return <Assignment />;
  }
};

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'low': return 'success';
    case 'medium': return 'warning';
    case 'high': return 'error';
    case 'critical': return 'error';
    default: return 'default';
  }
};

export default function CCNList() {
  const { costChangeNotes, getCCNsByProject, approveCCN, rejectCCN, deleteCostChangeNote } = useCostChangeNote();
  const { currentProject, user } = useApp();
  const [selectedCCN, setSelectedCCN] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCCNForMenu, setSelectedCCNForMenu] = useState<any>(null);

  const projectCCNs = getCCNsByProject(currentProject?.id || '');

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, ccn: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedCCNForMenu(ccn);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCCNForMenu(null);
  };

  const handleViewDetails = (ccn: any) => {
    setSelectedCCN(ccn);
    setShowDetailsDialog(true);
    handleMenuClose();
  };

  const handleApprove = (ccn: any) => {
    approveCCN(ccn.id, user?.name || 'System');
    handleMenuClose();
  };

  const handleReject = (ccn: any) => {
    rejectCCN(ccn.id, 'Rejected by user');
    handleMenuClose();
  };

  const handleDelete = (ccn: any) => {
    if (window.confirm('Are you sure you want to delete this CCN?')) {
      deleteCostChangeNote(ccn.id);
    }
    handleMenuClose();
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  if (projectCCNs.length === 0) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            No Cost Change Notes found for this project. Create a new CCN to track cost variations.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom fontWeight={600}>
            Cost Change Notes - {currentProject?.name}
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>CCN Number</TableCell>
                  <TableCell>Change Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Total Variance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Urgency</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Initiated By</TableCell>
                  <TableCell>Actions</TableCell>
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
                      <Chip 
                        label={ccn.status.replace('_', ' ').toUpperCase()} 
                        color={getStatusColor(ccn.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ccn.urgency.toUpperCase()} 
                        color={getUrgencyColor(ccn.urgency) as any}
                        size="small"
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
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, ccn)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDetails(selectedCCNForMenu)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        
        {selectedCCNForMenu?.status === 'submitted' && (
          <>
            <MenuItem onClick={() => handleApprove(selectedCCNForMenu)}>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Approve</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleReject(selectedCCNForMenu)}>
              <ListItemIcon>
                <Cancel fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Reject</ListItemText>
            </MenuItem>
          </>
        )}
        
        {selectedCCNForMenu?.status === 'draft' && (
          <MenuItem onClick={() => handleDelete(selectedCCNForMenu)}>
            <ListItemIcon>
              <Delete fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Details Dialog */}
      <Dialog 
        open={showDetailsDialog} 
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Cost Change Note Details - {selectedCCN?.ccnNumber}
        </DialogTitle>
        <DialogContent>
          {selectedCCN && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Change Type</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getChangeTypeIcon(selectedCCN.changeType)}
                    <Typography>{selectedCCN.changeType.replace('_', ' ').toUpperCase()}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip 
                    label={selectedCCN.status.replace('_', ' ').toUpperCase()} 
                    color={getStatusColor(selectedCCN.status) as any}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Total Variance</Typography>
                  <Typography variant="h6" color={selectedCCN.totalVariance > 0 ? 'error.main' : 'success.main'}>
                    {selectedCCN.totalVariance > 0 ? '+' : ''}{formatCurrency(selectedCCN.totalVariance)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Effective Date</Typography>
                  <Typography>{new Date(selectedCCN.effectiveDate).toLocaleDateString()}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Reason & Justification</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><strong>Reason:</strong> {selectedCCN.reason}</Typography>
              <Typography variant="body2" sx={{ mb: 3 }}><strong>Justification:</strong> {selectedCCN.justification}</Typography>

              <Typography variant="h6" gutterBottom>Affected Items</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Reference</TableCell>
                      <TableCell>Item Description</TableCell>
                      <TableCell>Original Cost</TableCell>
                      <TableCell>Revised Cost</TableCell>
                      <TableCell>Variance</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCCN.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip label={item.referenceNumber} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{item.itemDescription}</TableCell>
                        <TableCell>{formatCurrency(item.originalCost)}</TableCell>
                        <TableCell>{formatCurrency(item.revisedCost)}</TableCell>
                        <TableCell>
                          <Typography color={item.variance > 0 ? 'error.main' : 'success.main'}>
                            {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {selectedCCN.notes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Additional Notes</Typography>
                  <Typography variant="body2">{selectedCCN.notes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}