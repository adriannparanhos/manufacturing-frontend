import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Alert, Skeleton } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import WarningIcon from '@mui/icons-material/Warning';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import { api } from '../services/api';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalPotentialRevenue: 0,
    totalMaterialItems: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, matRes, planRes] = await Promise.all([
          api.get('/products'),
          api.get('/raw-materials'),
          api.get('/planning')
        ]);

        const products = prodRes.data;
        const materials = matRes.data;
        const plan = planRes.data;

        const lowStock = materials.filter((m: any) => m.stockQuantity < 10).length;
        const potentialRevenue = plan.reduce((acc: number, item: any) => acc + (item.totalValue || 0), 0);
        
        setStats({
          totalProducts: products.length,
          lowStockCount: lowStock,
          totalPotentialRevenue: potentialRevenue,
          totalMaterialItems: materials.length
        });

      } catch (error) {
        console.error("Erro ao carregar dashboard", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const renderStatCard = (title: string, value: string | number, icon: any, color: 'success' | 'primary' | 'info' | 'error', subtext: string) => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: '100%',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
          cursor: 'default'
        }
      }}
    >
      <Box>
        <Typography color="textSecondary" variant="overline" fontWeight="bold">{title}</Typography>
        <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>{value}</Typography>
        <Typography variant="caption" color="textSecondary">{subtext}</Typography>
      </Box>
      <Box sx={{ bgcolor: `${color}.light`, p: 2, borderRadius: '50%', color: `${color}.main`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </Box>
    </Paper>
  );

  const renderSkeletonCard = () => (
    <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ width: '60%' }}>
        <Skeleton variant="text" width="80%" height={30} />
        <Skeleton variant="text" width="60%" height={60} />
        <Skeleton variant="text" width="40%" />
      </Box>
      <Skeleton variant="circular" width={60} height={60} />
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>Dashboard Operacional</Typography>
      
      {!loading && stats.lowStockCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Atenção: Você possui {stats.lowStockCount} matérias-primas com estoque crítico (abaixo de 10 unidades).
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          {loading ? renderSkeletonCard() : renderStatCard(
            "Receita Potencial", 
            `R$ ${stats.totalPotentialRevenue.toFixed(2)}`, 
            <MonetizationOnIcon fontSize="large" />, 
            "success", 
            "Baseado na sugestão automática"
          )}
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          {loading ? renderSkeletonCard() : renderStatCard(
            "Produtos Ativos", 
            stats.totalProducts, 
            <PrecisionManufacturingIcon fontSize="large" />, 
            "primary", 
            "Cadastrados no sistema"
          )}
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          {loading ? renderSkeletonCard() : renderStatCard(
            "Insumos em Estoque", 
            stats.totalMaterialItems, 
            <InventoryIcon fontSize="large" />, 
            "info", 
            "Tipos de materiais diferentes"
          )}
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          {loading ? renderSkeletonCard() : renderStatCard(
            "Alertas de Estoque", 
            stats.lowStockCount, 
            <WarningIcon fontSize="large" />, 
            "error", 
            "Itens precisando de reposição"
          )}
        </Box>

      </Box>
    </Box>
  );
};