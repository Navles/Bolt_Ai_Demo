'use client';
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  IconButton,
  Typography,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Code,
  Description,
  Category,
} from '@mui/icons-material';

export interface ProductItem {
  id: string;
  productCode: string;
  description: string;
  category: string;
  unit: string;
  standardRate: number;
  lastUpdated: string;
  isActive: boolean;
}

interface ProductDatabaseProps {
  open: boolean;
  onClose: () => void;
  onSelectItems: (items: ProductItem[]) => void;
  selectedItems?: string[];
}

// Mock product database - in real app, this would come from API
const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: '1',
    productCode: 'MAT-CEM-001',
    description: 'Cement - OPC 53 Grade',
    category: 'Materials',
    unit: 'Bags',
    standardRate: 450,
    lastUpdated: '2024-01-15',
    isActive: true,
  },
  {
    id: '2',
    productCode: 'MAT-STL-001',
    description: 'Steel Bars - 12mm TMT',
    category: 'Materials',
    unit: 'Tons',
    standardRate: 65000,
    lastUpdated: '2024-01-15',
    isActive: true,
  },
  {
    id: '3',
    productCode: 'MAT-STL-002',
    description: 'Steel Bars - 16mm TMT',
    category: 'Materials',
    unit: 'Tons',
    standardRate: 66000,
    lastUpdated: '2024-01-15',
    isActive: true,
  },
  {
    id: '4',
    productCode: 'LAB-SKL-001',
    description: 'Skilled Mason',
    category: 'Labor',
    unit: 'Days',
    standardRate: 800,
    lastUpdated: '2024-01-15',
    isActive: true,
  },
  {
    id: '5',
    productCode: 'LAB-HLP-001',
    description: 'Helper/Laborer',
    category: 'Labor',
    unit: 'Days',
    standardRate: 500,
    lastUpdated: '2024-01-15',
    isActive: true,
  },
  {
    id: '6',
    productCode: 'EQP-EXC-001',
    description: 'Excavator Rental - JCB 3DX',
    category: 'Equipment',
    unit: 'Days',
    standardRate: 12000,
    lastUpdated: '2024-01-15',
    isActive: true,
  },
  {
    id: '7',
    productCode: 'MAT-AGG-001',
    description: 'Coarse Aggregate - 20mm',
    category: 'Materials',
    unit: 'Cubic Meter',
    standardRate: 1200,
    lastUpdated: '2024-01-15',
    isActive: true,
  },
  {
    id: '8',
    productCode: 'MAT-AGG-002',
    description: 'Fine Aggregate - Sand',
    category: 'Materials',
    unit: 'Cubic Meter',
    standardRate: 800,
    lastUpdated: '2024-01-15',
    isActive: true,
  },
  {
    id: '9',
    productCode: 'TRN-TRK-001',
    description: 'Truck Transportation - 10 Ton',
    category: 'Transportation',
    unit: 'Trips',
    standardRate: 2500,
    lastUpdated: '2024-01-15',
    isActive: true,
  },
  {
    id: '10',
    productCode: 'SRV-CON-001',
    description: 'Concrete Mixing Service',
    category: 'Services',
    unit: 'Cubic Meter',
    standardRate: 3500,
    lastUpdated: '2024-01-15',
    isActive: true,
  },
];

export default function ProductDatabase({ 
  open, 
  onClose, 
  onSelectItems, 
  selectedItems = [] 
}: ProductDatabaseProps) {
  const [products, setProducts] = useState<ProductItem[]>(MOCK_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState<ProductItem[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(selectedItems);
  const [tabValue, setTabValue] = useState(0);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const filterProducts = () => {
    let filtered = products.filter(product => product.isActive);

    // Filter by search term (product code or description)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.productCode.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleConfirmSelection = () => {
    const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
    onSelectItems(selectedProducts);
    onClose();
  };

  const generateProductCode = (category: string, description: string): string => {
    const categoryPrefix = {
      'Materials': 'MAT',
      'Labor': 'LAB',
      'Equipment': 'EQP',
      'Transportation': 'TRN',
      'Services': 'SRV',
      'Other': 'OTH'
    }[category] || 'OTH';

    const descWords = description.split(' ').slice(0, 2);
    const descPrefix = descWords.map(word => word.substring(0, 3).toUpperCase()).join('');
    
    // Find next available number
    const existingCodes = products
      .filter(p => p.productCode.startsWith(`${categoryPrefix}-${descPrefix}`))
      .map(p => {
        const match = p.productCode.match(/-(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      });
    
    const nextNumber = Math.max(0, ...existingCodes) + 1;
    return `${categoryPrefix}-${descPrefix}-${String(nextNumber).padStart(3, '0')}`;
  };

  const [newProduct, setNewProduct] = useState<Partial<ProductItem>>({
    description: '',
    category: 'Materials',
    unit: '',
    standardRate: 0,
  });

  const handleAddNewProduct = () => {
    if (!newProduct.description || !newProduct.unit || !newProduct.standardRate) {
      return;
    }

    const productCode = generateProductCode(newProduct.category!, newProduct.description);
    
    const product: ProductItem = {
      id: Date.now().toString(),
      productCode,
      description: newProduct.description,
      category: newProduct.category!,
      unit: newProduct.unit,
      standardRate: newProduct.standardRate,
      lastUpdated: new Date().toISOString().split('T')[0],
      isActive: true,
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      description: '',
      category: 'Materials',
      unit: '',
      standardRate: 0,
    });
    setTabValue(0); // Switch back to selection tab
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Product Database</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search by code or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
          <Tab label="Select Products" />
          <Tab label="Add New Product" />
        </Tabs>

        {tabValue === 0 && (
          <>
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category === 'all' ? 'All Categories' : category}
                  onClick={() => setSelectedCategory(category)}
                  color={selectedCategory === category ? 'primary' : 'default'}
                  variant={selectedCategory === category ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            {selectedProductIds.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {selectedProductIds.length} product(s) selected
              </Alert>
            )}

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Button
                        size="small"
                        onClick={handleSelectAll}
                        variant={selectedProductIds.length === filteredProducts.length ? 'contained' : 'outlined'}
                      >
                        {selectedProductIds.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Code fontSize="small" />
                        Product Code
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Description fontSize="small" />
                        Description
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Category fontSize="small" />
                        Category
                      </Box>
                    </TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Standard Rate (₹)</TableCell>
                    <TableCell>Last Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow 
                      key={product.id} 
                      hover
                      selected={selectedProductIds.includes(product.id)}
                      onClick={() => handleProductToggle(product.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Button
                          size="small"
                          variant={selectedProductIds.includes(product.id) ? 'contained' : 'outlined'}
                          color={selectedProductIds.includes(product.id) ? 'primary' : 'inherit'}
                        >
                          {selectedProductIds.includes(product.id) ? 'Selected' : 'Select'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {product.productCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {product.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={product.category} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        ₹{product.standardRate.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {product.lastUpdated}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredProducts.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No products found matching your search criteria.
                </Typography>
              </Box>
            )}
          </>
        )}

        {tabValue === 1 && (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Add New Product
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Product code will be automatically generated based on category and description.
            </Alert>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Product Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Cement - OPC 53 Grade"
              />
              
              <TextField
                fullWidth
                label="Category"
                select
                value={newProduct.category}
                onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                SelectProps={{ native: true }}
              >
                <option value="Materials">Materials</option>
                <option value="Labor">Labor</option>
                <option value="Equipment">Equipment</option>
                <option value="Transportation">Transportation</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </TextField>
              
              <TextField
                fullWidth
                label="Unit"
                value={newProduct.unit}
                onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="e.g., Bags, Tons, Days, Cubic Meter"
              />
              
              <TextField
                fullWidth
                label="Standard Rate (₹)"
                type="number"
                value={newProduct.standardRate}
                onChange={(e) => setNewProduct(prev => ({ ...prev, standardRate: parseFloat(e.target.value) || 0 }))}
              />

              {newProduct.description && newProduct.category && (
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                  <Typography variant="body2" color="primary.dark">
                    <strong>Generated Product Code:</strong> {generateProductCode(newProduct.category, newProduct.description)}
                  </Typography>
                </Box>
              )}
              
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddNewProduct}
                disabled={!newProduct.description || !newProduct.unit || !newProduct.standardRate}
                size="large"
              >
                Add Product to Database
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {tabValue === 0 && (
          <Button 
            variant="contained" 
            onClick={handleConfirmSelection}
            disabled={selectedProductIds.length === 0}
          >
            Add Selected Items ({selectedProductIds.length})
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}