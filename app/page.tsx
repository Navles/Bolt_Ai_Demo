'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Grid,
  Typography,
  Toolbar,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  ShoppingCart,
  Assignment,
} from '@mui/icons-material';

import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import StatsCard from './components/Dashboard/StatsCard';
import RecentActivity from './components/Dashboard/RecentActivity';
import EstimationForm from './components/Estimation/EstimationForm';
import POForm from './components/PurchaseOrders/POForm';
import CRSReport from './components/Reports/CRSReport';
import CCNForm from './components/CostChangeNote/CCNForm';
import CCNList from './components/CostChangeNote/CCNList';
import CCNReport from './components/Reports/CCNReport';
import { useEstimation } from './context/EstimationContext';

const CostChart = dynamic(() => import('./components/Dashboard/CostChart'), {
  ssr: false
});

const drawerWidth = 280;

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { getProjectSummary } = useEstimation();
  
  const projectSummary = getProjectSummary();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Dashboard Overview
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Track project costs, monitor variances, and manage financial performance
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Total Contract Value"
                  value={`₹${((projectSummary.totalEstimate || 0) / 100000).toFixed(1)}L`}
                  change={5.2}
                  icon={<AccountBalance />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Committed Costs"
                  value={`₹${((projectSummary.totalCommitted || 0) / 100000).toFixed(1)}L`}
                  change={-2.1}
                  icon={<ShoppingCart />}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Actual Costs"
                  value={`₹${((projectSummary.totalActual || 0) / 100000).toFixed(1)}L`}
                  change={8.3}
                  icon={<TrendingUp />}
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatsCard
                  title="Active Estimates"
                  value="12"
                  change={15.5}
                  icon={<Assignment />}
                  color="secondary"
                />
              </Grid>
            </Grid>
            
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <CostChart />
              </Grid>
              <Grid item xs={12} lg={4}>
                <RecentActivity />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'estimation':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Cost Estimation
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Create and manage cost estimations for project components
            </Typography>
            <EstimationForm />
          </Box>
        );
      
      case 'cost-change-notes':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Cost Change Notes
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Track and manage cost variations and changes
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <CCNForm />
              </Grid>
              <Grid item xs={12}>
                <CCNList />
              </Grid>
              <Grid item xs={12}>
                <CCNReport />
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'purchase-orders':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Purchase Orders
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Manage purchase orders and vendor commitments
            </Typography>
            <POForm />
          </Box>
        );
      
      case 'reports':
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Financial Reports
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Generate comprehensive financial reports and analysis
            </Typography>
            <CRSReport />
          </Box>
        );
      
      default:
        return (
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This section is under development.
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}