import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Typography } from '@mui/material';

const Dashboard = () => <Typography variant="h4">Bem-vindo ao Sistema</Typography>;
const RawMaterials = () => <Typography variant="h4">Tela de Matérias-Primas</Typography>;
const Products = () => <Typography variant="h4">Tela de Produtos</Typography>;
const Planning = () => <Typography variant="h4">Tela de Planejamento</Typography>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="raw-materials" element={<RawMaterials />} />
          <Route path="products" element={<Products />} />
          <Route path="planning" element={<Planning />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;