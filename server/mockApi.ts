import type { Connect } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Product, Order, CustomerInfo, CartItem } from '../src/types';

const products: Product[] = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.', image: '/public/images/wirelessheadphones.avif', category: 'Electronics', rating: 4.5, stock: 25 },
  { id: 2, name: 'Organic Cotton T-Shirt', price: 29.99, description: 'Soft organic cotton t-shirt available in multiple colors.', image: '/public/images/OrganicCottonT-Shirt.webp', category: 'Clothing', rating: 4.2, stock: 100 },
  { id: 3, name: 'Stainless Steel Water Bottle', price: 24.99, description: 'Double-wall insulated water bottle, keeps drinks cold for 24 hours.', image: '/public/images/StainlessSteelWaterBottle.jpeg', category: 'Accessories', rating: 4.8, stock: 50 },
  { id: 4, name: 'Mechanical Keyboard', price: 129.99, description: 'RGB mechanical keyboard with cherry MX switches.', image: '/public/images/MechanicalKeyboard.jpeg', category: 'Electronics', rating: 4.7, stock: 15 },
  { id: 5, name: 'Running Shoes', price: 89.99, description: 'Lightweight running shoes with superior cushioning technology.', image: '/public/images/RunningShoes.avif', category: 'Footwear', rating: 4.4, stock: 40 },
  { id: 6, name: 'Smart Watch', price: 199.99, description: 'Feature-rich smart watch with health monitoring and GPS.', image: '/public/images/SmartWatch.webp', category: 'Electronics', rating: 4.6, stock: 20 },
  { id: 7, name: 'Leather Backpack', price: 59.99, description: 'Genuine leather backpack with laptop compartment.', image: '/public/images/LeatherBackpack.jpg', category: 'Accessories', rating: 4.3, stock: 30 },
  { id: 8, name: 'Yoga Mat', price: 34.99, description: 'Non-slip eco-friendly yoga mat with carrying strap.', image: '/public/images/YogaMat.webp', category: 'Sports', rating: 4.1, stock: 60 },
];

const orders: Order[] = [];
let orderCounter = 0;

function json(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function errorJson(res: ServerResponse, status: number, message: string, details?: string, path?: string) {
  json(res, status, {
    statusCode: status,
    message,
    details,
    timestamp: new Date().toISOString(),
    path,
  });
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function matchPath(url: string): { route: string; params: Record<string, string> } | null {
  const path = url.split('?')[0];

  if (path === '/api/products') return { route: 'GET_PRODUCTS', params: {} };
  const productMatch = path.match(/^\/api\/products\/(\d+)$/);
  if (productMatch) return { route: 'GET_PRODUCT', params: { id: productMatch[1] } };

  if (path === '/api/orders') return { route: 'ORDERS', params: {} };
  const orderMatch = path.match(/^\/api\/orders\/([\w-]+)$/);
  if (orderMatch) return { route: 'GET_ORDER', params: { id: orderMatch[1] } };

  return null;
}

export function mockApiPlugin(): Connect.NextHandleFunction {
  return (req, res, next) => {
    if (!req.url?.startsWith('/api/')) return next();

    const match = matchPath(req.url);
    if (!match) {
      return errorJson(res, 404, 'Endpoint not found', undefined, req.url);
    }

    const { route, params } = match;

    if (route === 'GET_PRODUCTS' && req.method === 'GET') {
      return json(res, 200, products);
    }

    if (route === 'GET_PRODUCT' && req.method === 'GET') {
      const id = Number(params.id);
      const product = products.find((p) => p.id === id);
      if (!product) {
        return errorJson(res, 404, `Product with id ${id} not found`, undefined, req.url);
      }
      return json(res, 200, product);
    }

    if (route === 'ORDERS' && req.method === 'POST') {
      readBody(req)
        .then((body) => {
          let parsed: { items?: CartItem[]; customer?: CustomerInfo };
          try {
            parsed = JSON.parse(body);
          } catch {
            return errorJson(res, 400, 'Invalid JSON body', undefined, req.url);
          }

          const { items, customer } = parsed;
          if (!items || !Array.isArray(items) || items.length === 0) {
            return errorJson(res, 400, 'Order must contain at least one item', 'items array is empty or missing', req.url);
          }

          if (!customer?.name || !customer?.email || !customer?.address || !customer?.city || !customer?.zipCode) {
            return errorJson(res, 422, 'Missing required customer fields', 'name, email, address, city, and zipCode are required', req.url);
          }

          for (const item of items) {
            const product = products.find((p) => p.id === item.product.id);
            if (!product) {
              return errorJson(res, 404, `Product with id ${item.product.id} not found`, undefined, req.url);
            }
            if (product.stock < item.quantity) {
              return errorJson(res, 409, `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`, undefined, req.url);
            }
          }

          orderCounter++;
          const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
          const order: Order = {
            id: `ORD-${Date.now()}-${orderCounter.toString(36).toUpperCase()}`,
            items: [...items],
            total,
            customer,
            status: 'pending',
            createdAt: new Date(),
          };
          orders.push(order);

          for (const item of items) {
            const product = products.find((p) => p.id === item.product.id);
            if (product) product.stock -= item.quantity;
          }

          return json(res, 201, order);
        })
        .catch(() => {
          return errorJson(res, 500, 'Internal server error while processing order', undefined, req.url);
        });
      return;
    }

    if (route === 'ORDERS' && req.method === 'GET') {
      return json(res, 200, orders);
    }

    if (route === 'GET_ORDER' && req.method === 'GET') {
      const order = orders.find((o) => o.id === params.id);
      if (!order) {
        return errorJson(res, 404, `Order with id ${params.id} not found`, undefined, req.url);
      }
      return json(res, 200, order);
    }

    return errorJson(res, 405, `Method ${req.method} not allowed on ${req.url}`, undefined, req.url);
  };
}
