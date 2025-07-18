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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import { Add, Delete, Save, Send } from '@mui/icons-material';
import { useForm, useFieldArray } from 'react-hook-form';
import ProductDatabase, { ProductItem } from './ProductDatabase';
import ExcelUpload from './ExcelUpload';
import ExcelUpload from './ExcelUpload';
import ExcelUpload from './ExcelUpload';
import { useEstimation } from '../../context/EstimationContext';
import { useApp } from '../../context/AppContext';

interface EstimationItem {
  id?: string;
  productCode?: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  costHead?: string;
}

interface EstimationFormData {
  projectId: string;
  costHead: string;
  category: string;
  vendor: string;
  estimatedBy: string;
  items: EstimationItem[];
  notes: string;
}

const costHeads = [
  'OM01 - Material Cost',
  'OM02 - Manpower Cost',
  'OM03 - Subcontracting Cost',
  'OM04 - Equipment Cost',
  'OM05 - Transportation Cost',
  'OM06 - Miscellaneous Cost',
];

const categories = ['Materials', 'Labor', 'Equipment', 'Services', 'Other'];

export default function EstimationForm() {
  const { addEstimation } = useEstimation();
  const { currentProject, user } = useApp();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showProductDatabase, setShowProductDatabase] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);

  const { register, control, handleSubmit, watch, setValue, reset, getValues } = useForm<EstimationFormData>({
    defaultValues: {
      projectId: currentProject?.id || '',
      estimatedBy: user?.name || '',
      costHead: '',
      category: '',
      vendor: '',
      notes: '',
      items: [{ productCode: '', description: '', quantity: 1, unit: '', unitCost: 0, totalCost: 0 }]
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');
  const watchedCostHead = watch('costHead');

  const calculateTotal = (quantity: number, unitCost: number) => {
    return quantity * unitCost;
  };

  const handleProductSelection = (selectedProducts: ProductItem[]) => {
    console.log('Selected products from database:', selectedProducts);
    
    const currentItems = getValues('items');
    console.log('Current form items:', currentItems);
    
    // Filter out empty items
    const nonEmptyItems = currentItems.filter(item => 
      item.description.trim() !== '' && item.quantity > 0
    );
    
    // Convert selected products to form items
    const newItems: EstimationItem[] = selectedProducts.map((product, index) => ({
      id: `db-${Date.now()}-${index}`,
      productCode: product.productCode,
      description: product.description,
      quantity: 1,
      unit: product.unit,
      unitCost: product.standardRate,
      totalCost: product.standardRate,
      costHead: watchedCostHead || '',
    }));
    
    console.log('New items to add:', newItems);
    
    // Combine existing non-empty items with new items
    const allItems = [...nonEmptyItems, ...newItems];
    console.log('All items after combination:', allItems);
    
    // Replace all items in the form
    replace(allItems);
    
    setShowProductDatabase(false);
  };

  const handleExcelImport = (importedItems: any[]) => {
    console.log('Imported items from Excel:', importedItems);
    
    const currentItems = getValues('items');
    console.log('Current form items:', currentItems);
    
    // Filter out empty items
    const nonEmptyItems = currentItems.filter(item => 
      item.description.trim() !== '' && item.quantity > 0
    );
    
    console.log('Non-empty current items:', nonEmptyItems);
    console.log('Items to import:', importedItems);
    
    // Combine existing non-empty items with imported items
  const handleExcelImport = (importedItems: any[]) => {
    console.log('Imported items from Excel:', importedItems);
    
    const currentItems = getValues('items');
    console.log('Current form items:', currentItems);
    
    // Filter out empty items
    const nonEmptyItems = currentItems.filter(item => 
      item.description.trim() !== '' && item.quantity > 0
    );
    
    console.log('Non-empty current items:', nonEmptyItems);
    console.log('Items to import:', importedItems);
    
    // Combine existing non-empty items with imported items
  const handleExcelImport = (importedItems: any[]) => {
    console.log('Imported items from Excel:', importedItems);
    
    const currentItems = getValues('items');
    console.log('Current form items:', currentItems);
    
    // Filter out empty items
    const nonEmptyItems = currentItems.filter(item => 
      item.description.trim() !== '' && item.quantity > 0
    );
    
    console.log('Non-empty current items:', nonEmptyItems);
    console.log('Items to import:', importedItems);
    
    // Combine existing non-empty items with imported items
    const allItems = [...nonEmptyItems, ...importedItems];
    console.log('All items after combination:', allItems);
    
    // Replace all items in the form
    replace(allItems);
    
    setShowExcelUpload(false);
  };

  const addCustomItem = () => {
    append({
      id: `custom-${Date.now()}`,
      productCode: '',
      description: '',
      quantity: 1,
      unit: '',
      unitCost: 0,
      totalCost: 0,
      costHead: watchedCostHead || '',
    });
  };

  const updateItemTotal = (index: number, field: 'quantity' | 'unitCost', value: number) => {
    const currentItems = getValues('items');
    const item = currentItems[index];
    const quantity = field === 'quantity' ? value : item.quantity;
    const unitCost = field === 'unitCost' ? value : item.unitCost;
    const total = calculateTotal(quantity, unitCost);
    setValue(`items.${index}.totalCost`, total);
    return total;
  };

  const getTotalEstimation = () => {
    return watchedItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  };

  const onSubmit = (data: EstimationFormData, isDraft = false) => {
    try {
      console.log('Form data before processing:', data);
      
      // Filter out empty items and ensure proper structure
      const validItems = data.items.filter(item => 
        item.description.trim() !== '' && item.quantity > 0
      );

      console.log('Valid items after filtering:', validItems);

      if (validItems.length === 0) {
        setShowError(true);
        return;
      }

      // Process items with proper IDs and structure
      const processedItems = validItems.map((item, index) => ({
        id: item.id || `${Date.now()}-${index}`,
        productCode: item.productCode || `CUSTOM-${Date.now()}-${index}`,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        totalCost: item.totalCost,
        costHead: data.costHead,
      }));

      console.log('Processed items for submission:', processedItems);

      const estimationData = {
        projectId: data.projectId,
        costHead: data.costHead,
        category: data.category,
        vendor: data.vendor,
        estimatedBy: data.estimatedBy,
        items: processedItems,
        notes: data.notes,
        status: isDraft ? 'draft' : 'submitted' as const,
      };

      console.log('Final estimation data:', estimationData);

      addEstimation(estimationData);
      setShowSuccess(true);
      
      // Reset form after successful submission
      reset({
        projectId: currentProject?.id || '',
        estimatedBy: user?.name || '',
        costHead: '',
        category: '',
        vendor: '',
        notes: '',
        items: [{ productCode: '', description: '', quantity: 1, unit: '', unitCost: 0, totalCost: 0 }]
      });
    } catch (error) {
      console.error('Error saving estimation:', error);
      setShowError(true);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit((data) => onSubmit(data, true))();
  };

  const handleSubmitEstimation = () => {
    handleSubmit((data) => onSubmit(data, false))();
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom fontWeight={600}>
            Create New Cost Estimation
          </Typography>
          
          <form>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Project ID"
                  value={currentProject?.code || ''}
                  InputProps={{ readOnly: true }}
                  {...register('projectId')}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cost Head"
                  select
                  {...register('costHead', { required: true })}
                >
                  {costHeads.map((head) => (
                    <MenuItem key={head} value={head}>
                      {head}
                    </MenuItem>
                  ))}
                </TextField>
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
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Vendor/Supplier"
                  {...register('vendor')}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Estimated By"
                  value={user?.name || ''}
                  InputProps={{ readOnly: true }}
                  {...register('estimatedBy', { required: true })}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                Cost Items
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<Add />}
                  onClick={() => setShowProductDatabase(true)}
                  variant="contained"
                  disabled={!watchedCostHead}
                >
                  Add from Database
                </Button>
                <Button
                  startIcon={<Add />}
                  onClick={() => setShowExcelUpload(true)}
                  variant="contained"
                  color="secondary"
                  disabled={!watchedCostHead}
                >
                  Upload Excel
                </Button>
                <Button
                  startIcon={<Add />}
                  onClick={addCustomItem}
                  variant="outlined"
                  disabled={!watchedCostHead}
                >
                  Add Custom Item
                </Button>
              </Box>
            </Box>

            {!watchedCostHead && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Please select a Cost Head first before adding items.
              </Alert>
            )}

            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Unit Cost (₹)</TableCell>
                    <TableCell>Total Cost (₹)</TableCell>
                    <TableCell width="50">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          {...register(`items.${index}.productCode`)}
                          placeholder="Auto-generated"
                          InputProps={{
                            readOnly: !!watchedItems[index]?.productCode?.startsWith('MAT-') || 
                                     !!watchedItems[index]?.productCode?.startsWith('LAB-') ||
                                     !!watchedItems[index]?.productCode?.startsWith('EQP-') ||
                                     !!watchedItems[index]?.productCode?.startsWith('TRN-') ||
                                     !!watchedItems[index]?.productCode?.startsWith('SRV-'),
                            sx: (watchedItems[index]?.productCode?.includes('-')) ? { 
                              bgcolor: 'primary.light', 
                              color: 'primary.contrastText',
                              fontWeight: 600,
                            } : {}
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          {...register(`items.${index}.description`, { required: true })}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          {...register(`items.${index}.quantity`, {
                            valueAsNumber: true,
                            required: true,
                            min: 0.01,
                            onChange: (e) => {
                              const quantity = parseFloat(e.target.value) || 0;
                              updateItemTotal(index, 'quantity', quantity);
                            }
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          {...register(`items.${index}.unit`, { required: true })}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          {...register(`items.${index}.unitCost`, {
                            valueAsNumber: true,
                            required: true,
                            min: 0,
                            onChange: (e) => {
                              const unitCost = parseFloat(e.target.value) || 0;
                              updateItemTotal(index, 'unitCost', unitCost);
                            }
                          })}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          InputProps={{ readOnly: true }}
                          value={watchedItems[index]?.totalCost || 0}
                          sx={{ 
                            '& .MuiInputBase-input': { 
                              bgcolor: 'background.default',
                              fontWeight: 600,
                            } 
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {fields.length > 0 && getTotalEstimation() > 0 && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Total Estimation: ₹{getTotalEstimation().toLocaleString()}
                </Typography>
              </Box>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes/Comments"
                  multiline
                  rows={3}
                  {...register('notes')}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                startIcon={<Save />}
                onClick={handleSaveDraft}
                disabled={!watchedCostHead || fields.length === 0}
              >
                Save Draft
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Send />}
                onClick={handleSubmitEstimation}
                disabled={!watchedCostHead || fields.length === 0}
              >
                Submit Estimation
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <ProductDatabase
        open={showProductDatabase}
        onClose={() => setShowProductDatabase(false)}
        onSelectItems={handleProductSelection}
      />

      <ExcelUpload
        open={showExcelUpload}
        onClose={() => setShowExcelUpload(false)}
        onImport={handleExcelImport}
        costHead={watchedCostHead}
      />

      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Estimation saved successfully! The report page will now reflect your changes.
        </Alert>
      </Snackbar>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
      >
        <Alert onClose={() => setShowError(false)} severity="error" sx={{ width: '100%' }}>
          Error saving estimation. Please ensure all required fields are filled and try again.
        </Alert>
      </Snackbar>
    </>
  );
}