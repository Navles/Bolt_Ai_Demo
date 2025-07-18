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
  Typography,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  Checkbox,
} from '@mui/material';
import {
  Search,
  Add,
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
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  useEffect(() => {
    if (open) {
      setSelectedProductIds([]);
      setSearchTerm('');
      setSelectedCategory('all');
      setTabValue(0);
    }
  }, [open]);

  const filterProducts = () => {
    let filtered = products.filter(product => product.isActive);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.productCode.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
      );
    }

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
    setSelectedProductIds([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Product Database</Typography>
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
      </DialogTitle>

      <DialogContent>
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
                  <Checkbox
                    indeterminate={selectedProductIds.length > 0 && selectedProductIds.length < filteredProducts.length}
                    checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Product Code</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Standard Rate (₹)</TableCell>
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
                    <Checkbox
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                    />
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
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleConfirmSelection}
          disabled={selectedProductIds.length === 0}
        >
          Add Selected Items ({selectedProductIds.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}