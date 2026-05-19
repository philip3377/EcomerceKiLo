import { useState, type ChangeEvent, type FormEvent } from 'react';
import { sanitizeInput, validateEmail, validateZipCode, validateName, validateCreditCard } from '../utils/security';
import type { CustomerInfo } from '../types';
import { StatusCode, createApiError } from '../types/api';
import { useAppContext } from '../context/AppContext';

interface Props {
  onSubmit: (info: CustomerInfo) => void;
  total: number;
  submitting?: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  cardNumber?: string;
}

export default function CheckoutForm({ onSubmit, total, submitting }: Props) {
  const { dispatch } = useAppContext();
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!validateName(form.name)) errs.name = 'Name must be 2-100 characters, letters only';
    if (!validateEmail(form.email)) errs.email = 'Invalid email address';
    if (form.address.trim().length < 5) errs.address = 'Address must be at least 5 characters';
    if (form.city.trim().length < 2) errs.city = 'City must be at least 2 characters';
    if (!validateZipCode(form.zipCode)) errs.zipCode = 'Invalid ZIP code (e.g., 12345)';
    if (!validateCreditCard(form.cardNumber)) errs.cardNumber = 'Invalid card number (13-19 digits)';
    return errs;
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const sanitized = name === 'cardNumber' ? value.replace(/\D/g, '') : sanitizeInput(value);
    setForm((prev) => ({ ...prev, [name]: sanitized }));
    if (submitted) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      dispatch({
        type: 'SET_ERROR',
        payload: createApiError(
          StatusCode.UNPROCESSABLE_ENTITY,
          'Form validation failed. Please correct the highlighted fields.',
          Object.values(errs).join('; '),
          '/checkout'
        ),
      });
      return;
    }

    onSubmit({
      name: sanitizeInput(form.name),
      email: sanitizeInput(form.email),
      address: sanitizeInput(form.address),
      city: sanitizeInput(form.city),
      zipCode: sanitizeInput(form.zipCode),
      cardLast4: form.cardNumber.slice(-4),
    });
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit} noValidate>
      <h2>Checkout</h2>
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input id="name" name="name" value={form.name} onChange={handleChange} maxLength={100} autoComplete="name" />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} maxLength={254} autoComplete="email" />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="address">Address</label>
        <input id="address" name="address" value={form.address} onChange={handleChange} maxLength={200} autoComplete="street-address" />
        {errors.address && <span className="error">{errors.address}</span>}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input id="city" name="city" value={form.city} onChange={handleChange} maxLength={100} autoComplete="address-level2" />
          {errors.city && <span className="error">{errors.city}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="zipCode">ZIP Code</label>
          <input id="zipCode" name="zipCode" value={form.zipCode} onChange={handleChange} maxLength={10} autoComplete="postal-code" />
          {errors.zipCode && <span className="error">{errors.zipCode}</span>}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="cardNumber">Card Number</label>
        <input id="cardNumber" name="cardNumber" value={form.cardNumber} onChange={handleChange} maxLength={19} autoComplete="cc-number" inputMode="numeric" />
        {errors.cardNumber && <span className="error">{errors.cardNumber}</span>}
      </div>
      <div className="checkout-total">
        <strong>Total: {total.toFixed(2)} USD</strong>
      </div>
      <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
        {submitting ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
}
