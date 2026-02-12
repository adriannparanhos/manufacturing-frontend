import { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, TextField, MenuItem, Button, Divider, Alert, Stack, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Snackbar
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import { api } from '../services/api';
import type { Product, ProductionPlan } from '../types';

export const Planning = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<string>('');
  const [manualPlan, setManualPlan] = useState<ProductionPlan | null>(null);
  const [loadingManual, setLoadingManual] = useState(false);
  
  const [suggestionList, setSuggestionList] = useState<ProductionPlan[]>([]);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  const showToast = (message: string, severity: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  useEffect(() => {
    api.get<Product[]>('/products')
      .then(res => setProducts(res.data))
      .catch(() => showToast("Erro ao carregar produtos", "error"));
    
    handleLoadSuggestion();
  }, []);

  const handleCalculateManual = () => {
    if (!selectedProductId || !quantity) {
      showToast("Selecione um produto e informe a quantidade.", "warning");
      return;
    }

    setLoadingManual(true);
    setManualPlan(null);

    api.post<ProductionPlan>('/planning', {
      productId: selectedProductId,
      quantity: Number(quantity)
    })
    .then((response) => {
      setManualPlan(response.data);
      showToast("Planejamento realizado com sucesso!", "success");
      handleLoadSuggestion();
    })
    .catch((error) => {
      if (error.response && error.response.status === 400) {
        const msg = error.response.data.message || error.response.data || "Erro de validação.";
        showToast(msg, "error");
      } else {
        showToast("Erro ao conectar com o servidor.", "error");
      }
    })
    .finally(() => setLoadingManual(false));
  };

  const handleLoadSuggestion = () => {
    setLoadingSuggestion(true);
    api.get<ProductionPlan[]>('/planning')
      .then(res => setSuggestionList(res.data))
      .catch(() => showToast("Erro ao atualizar sugestões", "error"))
      .finally(() => setLoadingSuggestion(false));
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}>
        Planejamento de Produção
      </Typography>
      
      <Stack spacing={4}>
        
        <Paper elevation={3} sx={{ p: 3, borderLeft: '6px solid #2e7d32' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoModeIcon /> Sugestão Inteligente (Baseado no Estoque Atual)
              </Typography>
              <Typography variant="body2" color="textSecondary">
                O sistema prioriza produtos de maior valor agregado que cabem no seu estoque.
              </Typography>
            </Box>
            <Button onClick={handleLoadSuggestion} disabled={loadingSuggestion}>
              Atualizar Sugestão
            </Button>
          </Box>

          {suggestionList.length === 0 ? (
             <Alert severity="warning">Estoque insuficiente para produzir qualquer item completo.</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell><strong>Produto</strong></TableCell>
                    <TableCell align="right"><strong>Qtd. Sugerida</strong></TableCell>
                    <TableCell align="right"><strong>Valor Unit.</strong></TableCell>
                    <TableCell align="right"><strong>Receita Total Prevista</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {suggestionList.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.productName}</TableCell>
                      <TableCell align="right">{row.quantityToProduce}</TableCell>
                      <TableCell align="right">R$ {row.unitValue?.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'green' }}>
                        R$ {row.totalValue?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Divider>OU</Divider>

        <Paper elevation={3} sx={{ p: 3, borderLeft: '6px solid #1976d2' }}>
          <Typography variant="h6" gutterBottom color="primary">
            Ordem de Produção Manual
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
            <TextField
              select
              label="Produto"
              size="small"
              sx={{ minWidth: 200 }}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
            >
              {products.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} (R$ {Number(p.salesValue).toFixed(2)})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Qtd"
              type="number"
              size="small"
              sx={{ width: 120 }}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <Button 
              variant="contained" 
              startIcon={<CalculateIcon />}
              onClick={handleCalculateManual}
              disabled={loadingManual}
            >
              {loadingManual ? "Processando..." : "Produzir"}
            </Button>
          </Box>

          {manualPlan && (
            <Alert severity="success">
              Produção de <strong>{manualPlan.quantityToProduce}x {manualPlan.productName}</strong> realizada com sucesso! 
              Custo Total: R$ {manualPlan.totalValue?.toFixed(2)}
            </Alert>
          )}
        </Paper>
      </Stack>

      <Snackbar 
        open={toast.open} 
        autoHideDuration={6000} 
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};