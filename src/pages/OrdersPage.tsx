import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/security';
import { api } from '../utils/api';
import { useEffect, useState } from 'react';
import type { Order } from '../types';

export default function OrdersPage() {
  const { dispatch } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders().then((res) => {
      setLoading(false);
      if (res.success && res.data) {
        setOrders(res.data);
      } else if (res.error) {
        dispatch({ type: 'SET_ERROR', payload: res.error });
      }
    });
  }, [dispatch]);

  async function handleTrackOrder(orderId: string) {
    const res = await api.getOrder(orderId);
    if (res.success && res.data) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          statusCode: 200,
          message: `Order ${res.data.id} status: ${res.data.status.toUpperCase()}`,
          details: `Total: ${formatCurrency(res.data.total)} | Items: ${res.data.items.length}`,
          timestamp: new Date().toISOString(),
          path: `/api/orders/${orderId}`,
        },
      });
    } else if (res.error) {
      dispatch({ type: 'SET_ERROR', payload: res.error });
    }
  }

  if (loading) {
    return (
      <div className="page orders-page">
        <h1>Loading Orders...</h1>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page orders-page">
        <h1>No Orders Yet</h1>
        <p>Once you place an order, it will appear here.</p>
        <Link to="/" className="btn btn-primary">Go Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page orders-page">
      <h1>Your Orders</h1>
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order: {order.id}</span>
              <span className={`order-status status-${order.status}`}>{order.status.toUpperCase()}</span>
              <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.product.id} className="order-item">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <strong>Total: {formatCurrency(order.total)}</strong>
              <button
                className="btn btn-secondary"
                style={{ marginLeft: '1rem' }}
                onClick={() => handleTrackOrder(order.id)}
              >
                Track Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
