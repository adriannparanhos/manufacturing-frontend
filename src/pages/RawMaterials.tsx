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
  Tooltip
} from '@mui/material';
import { DataGrid} from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { api } from '../services/api';
import type { RawMaterial } from '../types';

export const RawMaterials = () => {
  const [rows, setRows] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); 
  
  const [formData, setFormData] = useState({
    name: '',
    stockQuantity: ''
  });

  const fetchMaterials = () => {
    setLoading(true);
    api.get<RawMaterial[]>('/raw-materials')
      .then((response) => setRows(response.data))
      .catch((error) => console.error("Erro ao buscar:", error))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSave = () => {
    if (!formData.name || !formData.stockQuantity) return alert("Preencha tudo!");

    api.post('/raw-materials', {
      name: formData.name,
      stockQuantity: parseFloat(formData.stockQuantity) 
    })
    .then(() => {
      fetchMaterials(); 
      handleClose();   
    })
    .catch((error) => {
      alert("Erro ao salvar!");
      console.error(error);
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      api.delete(`/raw-materials/${id}`)
        .then(() => fetchMaterials())
        .catch((error) => alert("Erro ao deletar (talvez esteja em uso num produto?)"));
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
    { field: 'stockQuantity', headerName: 'Estoque', width: 130 },
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
      {}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gerenciar Estoque</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleClickOpen}
        >
          Novo Item
        </Button>
      </Box>
      
      {}
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10]}
          disableRowSelectionOnClick
          sx={{ border: 0 }}
        />
      </Paper>

      {}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Cadastrar Matéria-Prima</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Nome do Item (Ex: Farinha)"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Quantidade em Estoque"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};