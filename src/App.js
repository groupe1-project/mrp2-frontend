import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Layout/Navbar';
import StockPage from './pages/StockPage';
import NomenclaturePage from './pages/NomenclaturePage';
import ForecastPage from './pages/ForecastPage';
import ProductsPage from './pages/ProductsPage';

function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<StockPage />} />
          <Route path="/stock" element={<StockPage />} />
          <Route path="/nomenclature" element={<NomenclaturePage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;