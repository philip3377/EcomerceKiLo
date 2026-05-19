import { useState, useMemo, useEffect, type ChangeEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { sanitizeInput } from '../utils/security';
import { api } from '../utils/api';
import type { Product } from '../types';

export default function HomePage() {
  const { dispatch } = useAppContext();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    api.getProducts().then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setProducts(res.data);
        setFetchError(null);
      } else {
        setFetchError(res.error?.message || 'Failed to load products');
      }
    });
  }, []);

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const sanitizedSearch = sanitizeInput(search).toLowerCase();
        const matchesSearch =
          p.name.toLowerCase().includes(sanitizedSearch) ||
          p.description.toLowerCase().includes(sanitizedSearch);
        const matchesCategory = category === 'All' || p.category === category;
        return matchesSearch && matchesCategory;
      }),
    [search, category, products]
  );

  function handleAddToCart(product: Product) {
    if (product.stock <= 0) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          statusCode: 409,
          message: `${product.name} is out of stock.`,
          details: 'This product is currently unavailable.',
          timestamp: new Date().toISOString(),
          path: '/api/products',
        },
      });
      return;
    }
    dispatch({ type: 'ADD_TO_CART', payload: product });
  }

  if (loading) {
    return (
      <div className="page home-page">
        <div className="hero">
          <h1>Welcome to ShopEase</h1>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="page home-page">
        <div className="hero">
          <h1>Welcome to ShopEase</h1>
          <p className="error">{fetchError}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page home-page">
      <div className="hero">
        <h1>Welcome to ShopEase</h1>
        <p>Discover amazing products at great prices</p>
      </div>
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="search-input"
          maxLength={100}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-select">
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="product-grid">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))
        ) : (
          <p className="no-results">No products found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}
