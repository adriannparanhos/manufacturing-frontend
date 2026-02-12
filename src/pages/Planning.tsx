import { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, TextField, MenuItem, Button, 
  Card, CardContent, Divider, Alert, Stack 
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { api } from '../services/api';
import type { Product, ProductionPlan } from '../types';

export const Planning = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<string>('');
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Product[]>('/products')
      .then(res => setProducts(res.data))
      .catch(console.error);
  }, []);

  const handleCalculate = () => {
    if (!selectedProductId || !quantity) return alert("Selecione produto e quantidade!");

    setLoading(true);
    setPlan(null);

    api.post<ProductionPlan>('/planning', {
      productId: selectedProductId,
      quantity: Number(quantity)
    })
    .then((response) => {
      setPlan(response.data);
    })
    .catch((error) => {
      alert("Erro ao calcular! Verifique o Backend.");
      console.error(error);
    })
    .finally(() => setLoading(false));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Planejamento de Produção</Typography>
      
      {}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>O que vamos produzir hoje?</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            select
            label="Selecione o Produto"
            sx={{ minWidth: 250 }}
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(Number(e.target.value))}
          >
            {products.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} (Venda: R$ {Number(p.salesValue).toFixed(2)})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Quantidade"
            type="number"
            sx={{ width: 150 }}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <Button 
            variant="contained" 
            size="large" 
            startIcon={<CalculateIcon />}
            onClick={handleCalculate}
            disabled={loading}
          >
            {loading ? "Calculando..." : "Calcular"}
          </Button>
        </Box>
      </Paper>

      {}
      {plan && (
        <Box sx={{ animation: 'fadeIn 0.5s' }}>
          {}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            
            {}
            <Box sx={{ flex: 1 }}> 
              <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Resumo do Pedido</Typography>
                  <Typography variant="h5" component="div">
                    {plan.productName}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="textSecondary">
                    Lote de {plan.quantityToProduce} unidades
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1">
                    Custo Unitário: <strong>R$ {plan.unitValue?.toFixed(2)}</strong>
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    Custo Total: R$ {plan.totalValue?.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {}
            <Box sx={{ flex: 2 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Matéria-Prima Necessária
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Verifique seu estoque físico antes de iniciar a produção.
                  </Alert>
                  
                  <Typography variant="body1">
                    O sistema calculou o custo total baseando-se na receita cadastrada.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

          </Stack>
        </Box>
      )}
    </Box>
  );
};