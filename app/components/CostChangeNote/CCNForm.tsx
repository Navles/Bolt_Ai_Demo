'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Snackbar,
} from '@mui/material';
import {
  Save,
  Send,
  AttachFile,
  Search,
  Assignment,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Warning,
  Info,
} from '@mui/icons-material';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCostChangeNote } from '../../context/CostChangeNoteContext';
import { useEstimation } from '../../context/EstimationContext';
import { useApp } from '../../context/AppContext';

interface CCNItem {
  id?: string;
  referenceType: 'estimation' | 'purchase_order' | 'actual_cost';
  referenceId: string;
  referenceNumber: string;
  itemDescription: string;
  originalCost: number;
  revisedCost: number;
  variance: number;
  variancePercent: number;
  reason: string;
  costHead: string;
}

interface CCNFormData {
  ccnNumber: string;
  projectId: string;
  changeType: 'increase' | 'decrease' | 'scope_change';
  category: 'material' | 'labor' | 'equipment' | 'overhead' | 'other';
  initiatedBy: string;
  reason: string;
  justification: string;
  items: CCNItem[];
  attachments: string[];
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  approvalRequired: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  effectiveDate: string;
  notes: string;
}

const changeTypes = [
  { value: 'increase', label: 'Cost Increase', icon: <TrendingUp />, color: 'error' },
  { value: 'decrease', label: 'Cost Decrease', icon: <TrendingDown />, color: 'success' },
  { value: 'scope_change', label: 'Scope Change', icon: <Warning />, color: 'warning' },
];

const categories = [
  'material',
  'labor', 
  'equipment',
  'overhead',
  'other'
];

const urgencyLevels = [
  { value: 'low', label: 'Low', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'warning' },
  { value: 'high', label: 'High', color: 'error' },
  { value: 'critical', label: 'Critical', color: 'error' },
];

export default function CCNForm() {
  const { addCostChangeNote } = useCostChangeNote();
  const { estimations } = useEstimation();
  const { currentProject, user } = useApp();
  const [showReferenceDialog, setShowReferenceDialog] = useState(false);
  const [selectedReferences, setSelectedReferences] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const { register, control, handleSubmit, watch, setValue, reset, getValues } = useForm<CCNFormData>({
    defaultValues: {
      projectId: currentProject?.id || '',
      initiatedBy: user?.name || '',
      status: 'draft',
      approvalRequired: true,
      urgency: 'medium',
      changeType: 'increase',
      category: 'material',
      items: [],
      attachments: [],
      effectiveDate: new Date().toISOString().split('T')[0],
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');
  const watchedChangeType = watch('changeType');

  // Get available references (estimations, POs, etc.)
  const getAvailableReferences = () => {
    const references: any[] = [];
    
    // Add estimations
    estimations
      .filter(est => est.projectId === currentProject?.id && est.status === 'approved')
      .forEach(estimation => {
        estimation.items.forEach(item => {
          references.push({
            type: 'estimation',
            id: estimation.id,
            number: estimation.id,
            description: item.description,
            cost: item.totalCost,
            costHead: item.costHead,
            itemId: item.id,
            category: estimation.category,
          });
        });
      });

    // Mock PO references - in real app, this would come from PO system
    const mockPOs = [
      {
        type: 'purchase_order',
        id: 'PO-001',
        number: 'PO-001/2024',
        description: 'Cement - OPC 53 Grade',
        cost: 45000,
        costHead: 'OM01 - Material Cost',
        itemId: 'po-item-1',
        category: 'material',
      },
      {
        type: 'purchase_order',
        id: 'PO-002',
        number: 'PO-002/2024',
        description: 'Steel Bars - 12mm TMT',
        cost: 325000,
        costHead: 'OM01 - Material Cost',
        itemId: 'po-item-2',
        category: 'material',
      },
    ];

    references.push(...mockPOs);

    return references;
  };

  const handleReferenceSelection = (references: any[]) => {
    const ccnItems: CCNItem[] = references.map(ref => ({
      referenceType: ref.type as 'estimation' | 'purchase_order',
      referenceId: ref.id,
      referenceNumber: ref.number,
      itemDescription: ref.description,
      originalCost: ref.cost,
      revisedCost: ref.cost, // Will be updated by user
      variance: 0,
      variancePercent: 0,
      reason: '',
      costHead: ref.costHead,
    }));

    const currentItems = getValues('items');
    replace([...currentItems, ...ccnItems]);
    setShowReferenceDialog(false);
  };

  const calculateVariance = (index: number, revisedCost: number) => {
    const item = watchedItems[index];
    if (!item) return;

    const variance = revisedCost - item.originalCost;
    const variancePercent = item.originalCost > 0 ? (variance / item.originalCost) * 100 : 0;

    setValue(`items.${index}.variance`, variance);
    setValue(`items.${index}.variancePercent`, variancePercent);
  };

  const getTotalVariance = () => {
    return watchedItems.reduce((sum, item) => sum + (item.variance || 0), 0);
  };

  const getTotalOriginalCost = () => {
    return watchedItems.reduce((sum, item) => sum + (item.originalCost || 0), 0);
  };

  const getTotalRevisedCost = () => {
    return watchedItems.reduce((sum, item) => sum + (item.revisedCost || 0), 0);
  };

  const onSubmit = (data: CCNFormData, isDraft = false) => {
    try {
      if (data.items.length === 0) {
        setShowError(true);
        return;
      }

      const totalVariance = getTotalVariance();
      const ccnData = {
        ...data,
        ccnNumber: `CCN-${Date.now()}`,
        status: isDraft ? 'draft' : 'submitted' as const,
        totalVariance,
        totalOriginalCost: getTotalOriginalCost(),
        totalRevisedCost: getTotalRevisedCost(),
      };

      addCostChangeNote(ccnData);
      setShowSuccess(true);
      
      // Reset form
      reset({
        projectId: currentProject?.id || '',
        initiatedBy: user?.name || '',
        status: 'draft',
        approvalRequired: true,
        urgency: 'medium',
        changeType: 'increase',
        category: 'material',
        items: [],
        attachments: [],
        effectiveDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error saving CCN:', error);
      setShowError(true);
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" component="div" fontWeight={600}>
              Create Cost Change Note (CCN)
            </Typography>
            <Chip label="Draft" color="warning" />
          </Box>

          <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CCN Number"
                  placeholder="Auto-generated"
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project"
                  value={`${currentProject?.code} - ${currentProject?.name}`}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Change Type</FormLabel>
                  <RadioGroup
                    row
                    {...register('changeType')}
                    value={watchedChangeType}
                  >
                    {changeTypes.map((type) => (
                      <FormControlLabel
                        key={type.value}
                        value={type.value}
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {type.icon}
                            {type.label}
                          </Box>
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Category"
                  select
                  {...register('category', { required: true })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Urgency Level"
                  select
                  {...register('urgency', { required: true })}
                >
                  {urgencyLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      <Chip label={level.label} color={level.color as any} size="small" />
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Effective Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  {...register('effectiveDate', { required: true })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Change"
                  multiline
                  rows={2}
                  {...register('reason', { required: true })}
                  placeholder="Brief description of why this change is needed"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Detailed Justification"
                  multiline
                  rows={3}
                  {...register('justification', { required: true })}
                  placeholder="Detailed explanation and business justification for the cost change"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                Cost Change Items
              </Typography>
              <Button
                startIcon={<Search />}
                onClick={() => setShowReferenceDialog(true)}
                variant="contained"
              >
                Add from References
              </Button>
            </Box>

            {fields.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No items added yet. Click "Add from References" to select items from estimations or purchase orders.
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Reference</TableCell>
                      <TableCell>Item Description</TableCell>
                      <TableCell>Cost Head</TableCell>
                      <TableCell>Original Cost (₹)</TableCell>
                      <TableCell>Revised Cost (₹)</TableCell>
                      <TableCell>Variance (₹)</TableCell>
                      <TableCell>Variance %</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <Box>
                            <Chip 
                              label={watchedItems[index]?.referenceNumber} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                            <Typography variant="caption" display="block" color="text.secondary">
                              {watchedItems[index]?.referenceType?.replace('_', ' ').toUpperCase()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{watchedItems[index]?.itemDescription}</TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {watchedItems[index]?.costHead}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={watchedItems[index]?.originalCost || 0}
                            InputProps={{ readOnly: true }}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            {...register(`items.${index}.revisedCost`, {
                              valueAsNumber: true,
                              required: true,
                              onChange: (e) => {
                                const value = parseFloat(e.target.value) || 0;
                                calculateVariance(index, value);
                              }
                            })}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {(watchedItems[index]?.variance || 0) > 0 ? (
                              <TrendingUp color="error" fontSize="small" />
                            ) : (
                              <TrendingDown color="success" fontSize="small" />
                            )}
                            <Typography 
                              color={(watchedItems[index]?.variance || 0) > 0 ? 'error.main' : 'success.main'}
                              fontWeight={600}
                            >
                              ₹{Math.abs(watchedItems[index]?.variance || 0).toLocaleString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            color={(watchedItems[index]?.variancePercent || 0) > 0 ? 'error.main' : 'success.main'}
                            fontWeight={600}
                          >
                            {(watchedItems[index]?.variancePercent || 0) > 0 ? '+' : ''}
                            {(watchedItems[index]?.variancePercent || 0).toFixed(2)}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            multiline
                            rows={2}
                            {...register(`items.${index}.reason`, { required: true })}
                            placeholder="Reason for this change"
                            sx={{ width: 200 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => remove(index)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {fields.length > 0 && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Total Original Cost</Typography>
                    <Typography variant="h6" fontWeight={600}>
                      ₹{getTotalOriginalCost().toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Total Revised Cost</Typography>
                    <Typography variant="h6" fontWeight={600}>
                      ₹{getTotalRevisedCost().toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Total Variance</Typography>
                    <Typography 
                      variant="h6" 
                      fontWeight={600}
                      color={getTotalVariance() > 0 ? 'error.main' : 'success.main'}
                    >
                      {getTotalVariance() > 0 ? '+' : ''}₹{getTotalVariance().toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">Variance %</Typography>
                    <Typography 
                      variant="h6" 
                      fontWeight={600}
                      color={getTotalVariance() > 0 ? 'error.main' : 'success.main'}
                    >
                      {getTotalVariance() > 0 ? '+' : ''}
                      {getTotalOriginalCost() > 0 ? ((getTotalVariance() / getTotalOriginalCost()) * 100).toFixed(2) : 0}%
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox {...register('approvalRequired')} defaultChecked />}
                  label="Requires Management Approval"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={3}
                  {...register('notes')}
                  placeholder="Any additional information or comments"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant="outlined" startIcon={<AttachFile />}>
                Attach Documents
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<Save />}
                  onClick={handleSubmit((data) => onSubmit(data, true))}
                >
                  Save Draft
                </Button>
                <Button 
                  variant="contained" 
                  type="submit" 
                  startIcon={<Send />}
                  disabled={fields.length === 0}
                >
                  Submit for Approval
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Reference Selection Dialog */}
      <Dialog 
        open={showReferenceDialog} 
        onClose={() => setShowReferenceDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Select Reference Items</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select items from approved estimations or purchase orders to create cost change notes.
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Select</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Cost Head</TableCell>
                  <TableCell>Current Cost (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getAvailableReferences().map((ref, index) => (
                  <TableRow key={`${ref.type}-${ref.id}-${index}`} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedReferences(prev => [...prev, ref]);
                          } else {
                            setSelectedReferences(prev => prev.filter(r => r !== ref));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ref.type === 'estimation' ? 'EST' : 'PO'} 
                        size="small" 
                        color={ref.type === 'estimation' ? 'primary' : 'secondary'}
                        icon={ref.type === 'estimation' ? <Assignment /> : <ShoppingCart />}
                      />
                    </TableCell>
                    <TableCell>{ref.number}</TableCell>
                    <TableCell>{ref.description}</TableCell>
                    <TableCell>
                      <Typography variant="caption">{ref.costHead}</Typography>
                    </TableCell>
                    <TableCell>₹{ref.cost.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReferenceDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => handleReferenceSelection(selectedReferences)}
            disabled={selectedReferences.length === 0}
          >
            Add Selected Items ({selectedReferences.length})
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success">
          Cost Change Note saved successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error">
          Error saving Cost Change Note. Please check all required fields.
        </Alert>
      </Snackbar>
    </>
  );
}