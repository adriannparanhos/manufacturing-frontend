import { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Button, Chip, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, IconButton, 
  List, ListItem, ListItemText, Divider, Snackbar, Alert, InputAdornment
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { api } from '../services/api';
import type { Product, RawMaterial } from '../types';

export const Products = () => {
  const [rows, setRows] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  
  const [recipe, setRecipe] = useState<{ materialId: number; materialName: string; quantity: number }[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');
  const [ingredientQty, setIngredientQty] = useState('');

  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning'
  });

  const showToast = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ open: true, message, severity });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, matRes] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<RawMaterial[]>('/raw-materials')
      ]);
      setRows(prodRes.data);
      setMaterials(matRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      showToast("Erro ao carregar dados do servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    if (!selectedMaterialId || !ingredientQty) {
      showToast("Selecione um item e a quantidade", "warning");
      return;
    }

    const material = materials.find(m => m.id === selectedMaterialId);
    if (!material) return;

    setRecipe([...recipe, {
      materialId: material.id,
      materialName: material.name,
      quantity: Number(ingredientQty)
    }]);

    setSelectedMaterialId('');
    setIngredientQty('');
  };

  const removeIngredient = (indexToRemove: number) => {
    setRecipe(recipe.filter((_, index) => index !== indexToRemove));
  };

  const handleSaveProduct = async () => {
    if (!productName || !productPrice) {
      showToast("Preencha nome e preço", "warning");
      return;
    }
    if (recipe.length === 0) {
      showToast("Adicione pelo menos 1 ingrediente", "warning");
      return;
    }

    try {
      const payload = {
        name: productName,
        salesValue: Number(productPrice),
        compositions: recipe.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity
        }))
      };

      await api.post('/products', payload);
      
      setOpen(false);
      setProductName('');
      setProductPrice('');
      setRecipe([]);
      showToast("Produto salvo com sucesso!", "success");
      fetchData(); 

    } catch (error: any) {
      showToast("Erro ao salvar produto", "error");
      console.error(error);
    }
  };

  const checkViability = (product: Product) => {
    if (!product.compositions || product.compositions.length === 0) return false;

    return product.compositions.every((comp: any) => {
      const material = materials.find(m => m.id === comp.materialId);
      return material && material.stockQuantity >= comp.quantity;
    });
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Produto', flex: 1 },
    { 
      field: 'salesValue', 
      headerName: 'Preço', 
      width: 100,
      valueFormatter: (value: number) => value ? `R$ ${Number(value).toFixed(2)}` : ''
    },
    {
      field: 'status',
      headerName: 'Status Produção',
      width: 180,
      renderCell: (params) => {
        const isViable = checkViability(params.row);
        return (
          <Chip 
            icon={isViable ? <CheckCircleIcon /> : <ErrorIcon />}
            label={isViable ? "Produção Viável" : "Falta Estoque"}
            color={isViable ? "success" : "error"}
            variant="outlined"
            size="small"
          />
        );
      }
    },
    {
      field: 'compositions',
      headerName: 'Receita',
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', py: 1 }}>
          {params.row.compositions?.map((comp: any, idx: number) => (
            <Chip 
              key={idx}
              label={`${comp.materialName}: ${comp.quantity}`} 
              size="small" 
            />
          ))}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 80,
      renderCell: (params) => (
        <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
          <DeleteIcon />
        </IconButton>
      )
    }
  ];

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza? Isso excluirá o produto e sua receita.")) return;

    try {
      await api.delete(`/products/${id}`);
      showToast("Produto excluído com sucesso", "success");
      fetchData();
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data || "Erro ao excluir produto";
      showToast(msg, "error");
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Catálogo de Produtos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Novo Produto
        </Button>
      </Box>
      
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          getRowHeight={() => 'auto'} 
          disableRowSelectionOnClick
        />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Produto</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField 
              label="Nome do Produto" fullWidth 
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
            <TextField 
              label="Preço de Venda" 
              type="number" 
              fullWidth 
              value={productPrice}
              onChange={e => setProductPrice(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }}>Receita (Ingredientes)</Divider>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              select label="Matéria-Prima" fullWidth
              value={selectedMaterialId}
              onChange={e => setSelectedMaterialId(Number(e.target.value))}
            >
              {materials.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name} (Estoque: {m.stockQuantity})
                </MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Qtd" type="number" sx={{ width: 100 }}
              value={ingredientQty}
              onChange={e => setIngredientQty(e.target.value)}
            />
            <Button variant="outlined" onClick={handleAddIngredient}>Add</Button>
          </Box>

          <Paper variant="outlined" sx={{ mt: 2, maxHeight: 150, overflow: 'auto' }}>
            {recipe.length === 0 ? (
              <Typography sx={{ p: 2, color: 'gray', textAlign: 'center' }}>
                Nenhum ingrediente adicionado.
              </Typography>
            ) : (
              <List dense>
                {recipe.map((item, index) => (
                  <ListItem key={index}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => removeIngredient(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={item.materialName} 
                      secondary={`Quantidade: ${item.quantity}`} 
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveProduct} variant="contained">Salvar Produto</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};