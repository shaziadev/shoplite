import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, formatPrice } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { token } = useAuth();
  const { refresh } = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/orders/${id}`, { token }).then(setOrder).catch((err) => setError(err.message));
    // After a successful checkout the server emptied the cart, so re-sync it.
    if (params.get('success')) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  if (error) return <ErrorMessage message={error} />;
  if (!order) return <Spinner />;

  return (
    <section className="mx-auto max-w-2xl">
      {params.get('success') && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          Thank you! Your order has been placed.
          {order.status === 'pending' && ' Payment confirmation can take a few seconds, so refresh shortly.'}
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Order #{order._id.slice(-6).toUpperCase()}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>

        <ul className="mt-6 divide-y divide-slate-200">
          {order.items.map((item) => (
            <li key={item.product} className="flex justify-between py-3 text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <Link to="/orders" className="mt-6 inline-block text-sm text-indigo-600">← All orders</Link>
    </section>
  );
}
