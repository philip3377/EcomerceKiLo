import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import CartItemRow from '../components/CartItemRow';
import CheckoutForm from '../components/CheckoutForm';
import { formatCurrency } from '../utils/security';
import { useState } from 'react';
import type { CustomerInfo } from '../types';
import { api } from '../utils/api';

export default function CartPage() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  async function handleOrder(info: CustomerInfo) {
    if (state.cart.length === 0) {
      dispatch({
        type: 'SET_ERROR',
        payload: {
          statusCode: 400,
          message: 'Cannot place an order with an empty cart.',
          details: 'Cart must contain at least one item.',
          timestamp: new Date().toISOString(),
          path: '/api/orders',
        },
      });
      return;
    }

    setSubmitting(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    const res = await api.createOrder(state.cart, info);

    dispatch({ type: 'SET_LOADING', payload: false });
    setSubmitting(false);

    if (res.success && res.data) {
      dispatch({ type: 'ADD_ORDER_FROM_API', payload: res.data });
      dispatch({ type: 'CLEAR_CART' });
      navigate('/order-confirmation');
    } else if (res.error) {
      dispatch({ type: 'SET_ERROR', payload: res.error });
    }
  }

  if (state.cart.length === 0 && !showCheckout) {
    return (
      <div className="page cart-page">
        <h1>Your Cart is Empty</h1>
        <p>Start shopping to add items to your cart.</p>
        <Link to="/" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      {!showCheckout ? (
        <>
          <h1>Shopping Cart</h1>
          <div className="cart-list">
            {state.cart.map((item) => (
              <CartItemRow
                key={item.product.id}
                item={item}
                onUpdateQuantity={(id, qty) => dispatch({ type: 'UPDATE_QUANTITY', payload: { productId: id, quantity: qty } })}
                onRemove={(id) => dispatch({ type: 'REMOVE_FROM_CART', payload: id })}
              />
            ))}
          </div>
          <div className="cart-summary">
            <div className="cart-total">
              <span>Total:</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <div className="cart-actions">
              <button className="btn btn-secondary" onClick={() => dispatch({ type: 'CLEAR_CART' })}>Clear Cart</button>
              <button className="btn btn-primary" onClick={() => setShowCheckout(true)}>Proceed to Checkout</button>
            </div>
          </div>
        </>
      ) : (
        <>
          <button className="btn btn-back" onClick={() => setShowCheckout(false)}>← Back to Cart</button>
          <CheckoutForm onSubmit={handleOrder} total={total} submitting={submitting} />
        </>
      )}
    </div>
  );
}
