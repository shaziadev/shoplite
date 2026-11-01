import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatPrice } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders/mine', { token }).then(setOrders).catch((err) => setError(err.message));
  }, [token]);

  if (error) return <ErrorMessage message={error} />;
  if (!orders) return <Spinner />;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">My orders</h1>
      {orders.length === 0 ? (
        <p className="text-slate-500">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="card divide-y divide-slate-200">
          {orders.map((o) => (
            <li key={o._id}>
              <Link to={`/orders/${o._id}`} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <div>
                  <p className="font-medium">Order #{o._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-slate-500">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={o.status} />
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
