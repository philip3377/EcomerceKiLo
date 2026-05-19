import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/security';

export default function OrderConfirmationPage() {
  const { state } = useAppContext();
  const latestOrder = state.orders[state.orders.length - 1];

  if (!latestOrder) {
    return (
      <div className="page confirmation-page">
        <h1>No Order Found</h1>
        <Link to="/" className="btn btn-primary">Go Shopping</Link>
      </div>
    );
  }

  return (
    <div className="page confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p className="order-id">Order ID: <strong>{latestOrder.id}</strong></p>
        <div className="order-details">
          <h3>Order Summary</h3>
          {latestOrder.items.map((item) => (
            <div key={item.product.id} className="order-item">
              <span>{item.product.name} × {item.quantity}</span>
              <span>{formatCurrency(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="order-total">
            <strong>Total: {formatCurrency(latestOrder.total)}</strong>
          </div>
        </div>
        <div className="shipping-info">
          <h3>Shipping To</h3>
          <p>{latestOrder.customer.name}</p>
          <p>{latestOrder.customer.address}, {latestOrder.customer.city} {latestOrder.customer.zipCode}</p>
          <p>Card ending in ****{latestOrder.customer.cardLast4}</p>
        </div>
        <Link to="/" className="btn btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}
