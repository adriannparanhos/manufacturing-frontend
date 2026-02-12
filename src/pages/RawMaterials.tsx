import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  LinearProgress,
  Stack,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import { api } from '../services/api';
import type { RawMaterial, ProductionPlan, Product } from '../types';

export const RawMaterials = () => {
  const [rows, setRows] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  const [usageMap, setUsageMap] = useState<Map<number, number>>(new Map());

  const [formData, setFormData] = useState({
    name: '',
    stockQuantity: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const materialsRes = await api.get<RawMaterial[]>('/raw-materials');
      const materials = materialsRes.data;
      setRows(materials);

      const planRes = await api.get<ProductionPlan[]>('/planning');
      const suggestion = planRes.data;

      const productsRes = await api.get<Product[]>('/products');
      const products = productsRes.data;

      const newUsageMap = new Map<number, number>();

      suggestion.forEach(planItem => {
        const product = products.find(p => p.name === planItem.productName);
        if (product && product.compositions) {
          product.compositions.forEach((comp: any) => {
             const totalNeeded = comp.quantity * planItem.quantityToProduce;
             const currentUsage = newUsageMap.get(comp.materialId) || 0;
             newUsageMap.set(comp.materialId, currentUsage + totalNeeded);
          });
        }
      });

      setUsageMap(newUsageMap);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.stockQuantity) return alert("Preencha tudo!");
    api.post('/raw-materials', {
      name: formData.name,
      stockQuantity: parseFloat(formData.stockQuantity)
    })
    .then(() => { fetchData(); handleClose(); })
    .catch(() => alert("Erro ao salvar!"));
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza?')) {
      api.delete(`/raw-materials/${id}`)
        .then(() => fetchData())
        .catch(() => alert("Erro ao deletar"));
    }
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({ name: '', stockQuantity: '' });
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nome do Item', flex: 1 },
    { 
      field: 'stockQuantity', 
      headerName: 'Status do Estoque', 
      flex: 2,
      renderCell: (params) => {
        const stock = Number(params.value);
        const used = usageMap.get(params.row.id) || 0;
        const available = stock - used;
        
        const usagePercent = stock > 0 ? (used / stock) * 100 : 0;
        const color = usagePercent > 90 ? 'error' : usagePercent > 50 ? 'warning' : 'success';

        return (
          <Box sx={{ width: '100%', mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {stock} Total
              </Typography>
              {used > 0 && (
                 <Typography variant="caption" color="text.secondary">
                   -{used} na Sugestão ({available.toFixed(1)} Livres)
                 </Typography>
              )}
            </Box>
            
            <Tooltip title={`Sugerido para uso: ${used}`}>
              <LinearProgress 
                variant="determinate" 
                value={usagePercent} 
                color={color} 
                sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0' }}
              />
            </Tooltip>
          </Box>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 100,
      renderCell: (params) => (
        <Tooltip title="Excluir">
          <IconButton onClick={() => handleDelete(params.row.id)} color="error">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InventoryIcon fontSize="large" color="primary"/> Gerenciar Estoque
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleClickOpen}
        >
          Novo Item
        </Button>
      </Box>
      
      {/* Legenda */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
         <Chip label="Uso pela Sugestão Automática" size="small" color="primary" variant="outlined" />
      </Stack>

      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
          getRowHeight={() => 'auto'} 
          sx={{ 
            '& .MuiDataGrid-cell': { py: 1 }, 
            border: 0 
          }}
        />
      </Paper>

      {}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Cadastrar Matéria-Prima</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              autoFocus margin="dense" label="Nome" fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              margin="dense" label="Quantidade" type="number" fullWidth
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};