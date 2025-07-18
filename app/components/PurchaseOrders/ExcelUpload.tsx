'use client';
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Edit,
  CheckCircle,
  Error,
  Download,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

interface ExcelRow {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  costHead?: string;
  estimationRef?: string;
  isValid: boolean;
  errors: string[];
}

interface POExcelUploadProps {
  open: boolean;
  onClose: () => void;
  onImport: (items: any[]) => void;
}

const REQUIRED_COLUMNS = [
  'description',
  'quantity', 
  'unit',
  'unitCost'
];

const COLUMN_MAPPINGS = {
  'description': ['description', 'item', 'item description', 'particulars', 'material'],
  'quantity': ['quantity', 'qty', 'nos', 'number'],
  'unit': ['unit', 'uom', 'unit of measurement'],
  'unitCost': ['unit cost', 'rate', 'unit rate', 'cost per unit', 'price'],
  'costHead': ['cost head', 'cost center', 'category'],
  'estimationRef': ['estimation ref', 'reference', 'est ref', 'estimation'],
};

export default function POExcelUpload({ open, onClose, onImport }: POExcelUploadProps) {
  const [uploadedData, setUploadedData] = useState<ExcelRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [editingRow, setEditingRow] = useState<string | null>(null);

  const validateRow = (row: any, index: number): ExcelRow => {
    const errors: string[] = [];
    const id = `row-${index}`;

    // Check required fields
    if (!row.description || row.description.toString().trim() === '') {
      errors.push('Description is required');
    }
    
    const quantity = parseFloat(row.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.push('Quantity must be a positive number');
    }

    if (!row.unit || row.unit.toString().trim() === '') {
      errors.push('Unit is required');
    }

    const unitCost = parseFloat(row.unitCost);
    if (isNaN(unitCost) || unitCost < 0) {
      errors.push('Unit cost must be a valid number');
    }

    const totalCost = quantity * unitCost;

    return {
      id,
      description: row.description?.toString().trim() || '',
      quantity: isNaN(quantity) ? 0 : quantity,
      unit: row.unit?.toString().trim() || '',
      unitCost: isNaN(unitCost) ? 0 : unitCost,
      totalCost: isNaN(totalCost) ? 0 : totalCost,
      costHead: row.costHead?.toString().trim() || '',
      estimationRef: row.estimationRef?.toString().trim() || '',
      isValid: errors.length === 0,
      errors,
    };
  };

  const findColumnMapping = (headers: string[]): Record<string, string> => {
    const mapping: Record<string, string> = {};
    
    Object.entries(COLUMN_MAPPINGS).forEach(([key, possibleNames]) => {
      const foundHeader = headers.find(header => 
        possibleNames.some(name => 
          header.toLowerCase().includes(name.toLowerCase())
        )
      );
      if (foundHeader) {
        mapping[key] = foundHeader;
      }
    });

    return mapping;
  };

  const processExcelFile = (file: File) => {
    setIsProcessing(true);
    setUploadError('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          throw new Error('Excel file must contain at least a header row and one data row');
        }

        const headers = jsonData[0] as string[];
        const columnMapping = findColumnMapping(headers);

        // Check if we have the required columns
        const missingColumns = REQUIRED_COLUMNS.filter(col => !columnMapping[col]);
        if (missingColumns.length > 0) {
          throw new Error(`Missing required columns: ${missingColumns.join(', ')}. Please ensure your Excel file has columns for: ${REQUIRED_COLUMNS.join(', ')}`);
        }

        // Process data rows
        const processedData: ExcelRow[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row.length === 0 || row.every(cell => !cell)) continue; // Skip empty rows

          const mappedRow: any = {};
          Object.entries(columnMapping).forEach(([key, headerName]) => {
            const columnIndex = headers.indexOf(headerName);
            mappedRow[key] = row[columnIndex];
          });

          const validatedRow = validateRow(mappedRow, i);
          processedData.push(validatedRow);
        }

        if (processedData.length === 0) {
          throw new Error('No valid data rows found in the Excel file');
        }

        setUploadedData(processedData);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        setUploadError(error instanceof Error ? error.message : 'Failed to process Excel file');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
        setUploadError('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
        return;
      }
      processExcelFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const handleEditRow = (rowId: string, field: string, value: any) => {
    setUploadedData(prev => prev.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [field]: value };
        
        // Recalculate total cost if quantity or unit cost changed
        if (field === 'quantity' || field === 'unitCost') {
          updatedRow.totalCost = updatedRow.quantity * updatedRow.unitCost;
        }
        
        // Revalidate the row
        return validateRow(updatedRow, parseInt(rowId.split('-')[1]));
      }
      return row;
    }));
  };

  const handleDeleteRow = (rowId: string) => {
    setUploadedData(prev => prev.filter(row => row.id !== rowId));
  };

  const handleImport = () => {
    const validRows = uploadedData.filter(row => row.isValid);
    if (validRows.length === 0) {
      setUploadError('No valid rows to import. Please fix the errors first.');
      return;
    }

    const importItems = validRows.map(row => ({
      description: row.description,
      quantity: row.quantity,
      unit: row.unit,
      unitCost: row.unitCost,
      totalCost: row.totalCost,
      costHead: row.costHead || '',
      estimationRef: row.estimationRef || '',
    }));

    onImport(importItems);
    handleClose();
  };

  const handleClose = () => {
    setUploadedData([]);
    setFileName('');
    setUploadError('');
    setEditingRow(null);
    setIsProcessing(false);
    onClose();
  };

  const downloadTemplate = () => {
    const templateData = [
      ['Description', 'Quantity', 'Unit', 'Unit Cost', 'Cost Head', 'Estimation Ref'],
      ['Cement - OPC 53 Grade', 100, 'Bags', 450, 'OM01 - Material Cost', 'EST-001/2024'],
      ['Steel Bars - 12mm TMT', 5, 'Tons', 65000, 'OM01 - Material Cost', 'EST-002/2024'],
      ['Skilled Mason', 10, 'Days', 800, 'OM02 - Manpower Cost', 'EST-003/2024'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Purchase Order Template');
    XLSX.writeFile(wb, 'purchase_order_template.xlsx');
  };

  const validRowsCount = uploadedData.filter(row => row.isValid).length;
  const totalRowsCount = uploadedData.length;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Import Purchase Order Items from Excel</Typography>
          <Button
            startIcon={<Download />}
            onClick={downloadTemplate}
            variant="outlined"
            size="small"
          >
            Download Template
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {uploadedData.length === 0 ? (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Upload an Excel file with columns: Description, Quantity, Unit, Unit Cost, and optionally Cost Head and Estimation Ref.
              The system will automatically map column headers that match these fields.
            </Alert>

            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'primary.light' : 'background.default',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.light',
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop the Excel file here' : 'Drag & drop Excel file here'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                or click to browse files
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported formats: .xlsx, .xls, .csv
              </Typography>
            </Box>

            {isProcessing && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Processing Excel file...
                </Typography>
              </Box>
            )}

            {uploadError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {uploadError}
              </Alert>
            )}
          </Box>
        ) : (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Imported Data from: {fileName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`${validRowsCount} Valid Rows`} 
                    color="success" 
                    size="small"
                    icon={<CheckCircle />}
                  />
                  {totalRowsCount - validRowsCount > 0 && (
                    <Chip 
                      label={`${totalRowsCount - validRowsCount} Invalid Rows`} 
                      color="error" 
                      size="small"
                      icon={<Error />}
                    />
                  )}
                </Box>
              </Box>
              <Button
                variant="outlined"
                onClick={() => setUploadedData([])}
                startIcon={<Delete />}
              >
                Clear Data
              </Button>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 400, mb: 2 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Unit Cost (₹)</TableCell>
                    <TableCell>Total Cost (₹)</TableCell>
                    <TableCell>Cost Head</TableCell>
                    <TableCell>Estimation Ref</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {uploadedData.map((row) => (
                    <TableRow 
                      key={row.id}
                      sx={{ 
                        bgcolor: row.isValid ? 'success.light' : 'error.light',
                        '&:hover': { bgcolor: row.isValid ? 'success.main' : 'error.main' }
                      }}
                    >
                      <TableCell>
                        {row.isValid ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Box>
                            <Error color="error" />
                            {row.errors.map((error, index) => (
                              <Typography key={index} variant="caption" display="block" color="error">
                                {error}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === row.id ? (
                          <TextField
                            size="small"
                            value={row.description}
                            onChange={(e) => handleEditRow(row.id, 'description', e.target.value)}
                            onBlur={() => setEditingRow(null)}
                            fullWidth
                          />
                        ) : (
                          <Box onClick={() => setEditingRow(row.id)} sx={{ cursor: 'pointer' }}>
                            {row.description}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === row.id ? (
                          <TextField
                            size="small"
                            type="number"
                            value={row.quantity}
                            onChange={(e) => handleEditRow(row.id, 'quantity', parseFloat(e.target.value) || 0)}
                            onBlur={() => setEditingRow(null)}
                          />
                        ) : (
                          <Box onClick={() => setEditingRow(row.id)} sx={{ cursor: 'pointer' }}>
                            {row.quantity}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === row.id ? (
                          <TextField
                            size="small"
                            value={row.unit}
                            onChange={(e) => handleEditRow(row.id, 'unit', e.target.value)}
                            onBlur={() => setEditingRow(null)}
                          />
                        ) : (
                          <Box onClick={() => setEditingRow(row.id)} sx={{ cursor: 'pointer' }}>
                            {row.unit}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === row.id ? (
                          <TextField
                            size="small"
                            type="number"
                            value={row.unitCost}
                            onChange={(e) => handleEditRow(row.id, 'unitCost', parseFloat(e.target.value) || 0)}
                            onBlur={() => setEditingRow(null)}
                          />
                        ) : (
                          <Box onClick={() => setEditingRow(row.id)} sx={{ cursor: 'pointer' }}>
                            ₹{row.unitCost.toLocaleString()}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        ₹{row.totalCost.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {editingRow === row.id ? (
                          <TextField
                            size="small"
                            value={row.costHead}
                            onChange={(e) => handleEditRow(row.id, 'costHead', e.target.value)}
                            onBlur={() => setEditingRow(null)}
                          />
                        ) : (
                          <Box onClick={() => setEditingRow(row.id)} sx={{ cursor: 'pointer' }}>
                            {row.costHead || '-'}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRow === row.id ? (
                          <TextField
                            size="small"
                            value={row.estimationRef}
                            onChange={(e) => handleEditRow(row.id, 'estimationRef', e.target.value)}
                            onBlur={() => setEditingRow(null)}
                          />
                        ) : (
                          <Box onClick={() => setEditingRow(row.id)} sx={{ cursor: 'pointer' }}>
                            {row.estimationRef || '-'}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => setEditingRow(editingRow === row.id ? null : row.id)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteRow(row.id)}
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

            {validRowsCount > 0 && (
              <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                <Typography variant="h6" color="primary.dark">
                  Total Import Value: ₹{uploadedData
                    .filter(row => row.isValid)
                    .reduce((sum, row) => sum + row.totalCost, 0)
                    .toLocaleString()}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {uploadedData.length > 0 && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={validRowsCount === 0}
            startIcon={<CloudUpload />}
          >
            Import {validRowsCount} Valid Items
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}