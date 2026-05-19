import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export default function Navbar() {
  const { state, dispatch } = useAppContext();
  const itemCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const isDarkMode = state.theme === 'dark';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">ShopEase</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Products</Link>
        <Link to="/cart" className="cart-link">
          Cart {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
        {state.orders.length > 0 && <Link to="/orders">Orders</Link>}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          aria-label="Toggle light and dark mode"
        >
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>
    </nav>
  );
}
