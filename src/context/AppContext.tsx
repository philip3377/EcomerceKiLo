import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { CartItem, Product, CustomerInfo, Order } from '../types';
import type { ApiError } from '../types/api';
import { generateOrderId } from '../utils/security';

type Theme = 'light' | 'dark';

interface AppState {
  cart: CartItem[];
  orders: Order[];
  theme: Theme;
  error: ApiError | null;
  loading: boolean;
}

type Action =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'PLACE_ORDER'; payload: CustomerInfo }
  | { type: 'ADD_ORDER_FROM_API'; payload: Order }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_ERROR'; payload: ApiError | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

const initialState: AppState = {
  cart: [],
  orders: [],
  theme: 'light',
  error: null,
  loading: false,
};

function initializeState(initial: AppState): AppState {
  if (typeof window === 'undefined') {
    return initial;
  }

  const storedTheme = window.localStorage.getItem('theme') as Theme | null;
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return { ...initial, theme: storedTheme };
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return { ...initial, theme: prefersDark ? 'dark' : 'light' };
}

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existing = state.cart.find((item) => item.product.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.product.id === action.payload.id
              ? { ...item, quantity: Math.min(item.quantity + 1, item.product.stock) }
              : item
          ),
        };
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.payload, quantity: 1 }],
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter((item) => item.product.id !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: Math.max(1, Math.min(action.payload.quantity, item.product.stock)) }
            : item
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'PLACE_ORDER': {
      const total = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const order: Order = {
        id: generateOrderId(),
        items: [...state.cart],
        total,
        customer: action.payload,
        status: 'pending',
        createdAt: new Date(),
      };
      return {
        ...state,
        cart: [],
        orders: [...state.orders, order],
      };
    }
    case 'ADD_ORDER_FROM_API':
      return {
        ...state,
        orders: [...state.orders, action.payload],
      };
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'dark' ? 'light' : 'dark',
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState, initializeState);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', state.theme);
    }
  }, [state.theme]);

  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_ERROR' }), 8000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
