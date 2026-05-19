import type { CartItem } from '../types';
import { formatCurrency } from '../utils/security';

interface Props {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: Props) {
  return (
    <div className="cart-item">
      <img src={item.product.image} alt={item.product.name} className="cart-item-image" />
      <div className="cart-item-details">
        <h3>{item.product.name}</h3>
        <p className="cart-item-price">{formatCurrency(item.product.price)} each</p>
      </div>
      <div className="cart-item-quantity">
        <button className="qty-btn" onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}>-</button>
        <span>{item.quantity}</span>
        <button className="qty-btn" onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}>+</button>
      </div>
      <div className="cart-item-subtotal">
        {formatCurrency(item.product.price * item.quantity)}
      </div>
      <button className="btn btn-danger" onClick={() => onRemove(item.product.id)}>Remove</button>
    </div>
  );
}
