import { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Button, Chip, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, IconButton, 
  List, ListItem, ListItemText, Divider, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    if (!selectedMaterialId || !ingredientQty) return alert("Selecione um item e quantidade!");

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
    if (!productName || !productPrice) return alert("Preencha nome e preço!");
    if (recipe.length === 0) return alert("O produto precisa de pelo menos 1 ingrediente!");

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
      fetchData(); 

    } catch (error: any) {
      alert("Erro ao salvar! Verifique se não faltou estoque ou se o Backend está on.");
      console.error(error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Produto', flex: 1 },
    { 
      field: 'salesValue', 
      headerName: 'Preço (R$)', 
      width: 120,
      valueFormatter: (value: number) => {
        if (value == null) return '';
        return `R$ ${Number(value).toFixed(2)}`;
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
    }
  ];

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

      {}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Novo Produto</DialogTitle>
        <DialogContent>
          {}
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <TextField 
              label="Nome do Produto" 
              fullWidth 
              value={productName}
              onChange={e => setProductName(e.target.value)}
            />
            <TextField 
              label="Preço de Venda" 
              type="number" 
              fullWidth 
              value={productPrice}
              onChange={e => setProductPrice(e.target.value)}
            />
          </Box>

          <Divider sx={{ my: 2 }}>Receita (Ingredientes)</Divider>

          {}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              select
              label="Matéria-Prima"
              fullWidth
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
              label="Qtd" 
              type="number" 
              sx={{ width: 100 }}
              value={ingredientQty}
              onChange={e => setIngredientQty(e.target.value)}
            />
            <Button variant="outlined" onClick={handleAddIngredient}>Add</Button>
          </Box>

          {}
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
    </Box>
  );
};