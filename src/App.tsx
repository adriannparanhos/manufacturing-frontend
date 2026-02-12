import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Typography } from '@mui/material';
import { RawMaterials } from './pages/RawMaterials';
import { Products } from './pages/Products';
import { Planning } from './pages/Planning';

const Dashboard = () => <Typography variant="h4">Bem-vindo ao Sistema</Typography>;

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