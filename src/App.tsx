import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import ErrorNotification from './components/ErrorNotification';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import { useAppContext } from './context/AppContext';
import './App.css';

function App() {
  const { state } = useAppContext();

  useEffect(() => {
    document.body.classList.toggle('dark-theme', state.theme === 'dark');
    document.body.classList.toggle('light-theme', state.theme === 'light');
  }, [state.theme]);

  return (
    <div className="app">
      <ErrorNotification />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>&copy; 2026 ShopEase. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
