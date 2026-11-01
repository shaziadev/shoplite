import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, formatPrice } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ErrorMessage from '../components/ErrorMessage';

export default function CartPage() {
  const { token } = useAuth();
  const { cart, updateItem, removeItem } = useCart();
  const [params] = useSearchParams();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Wraps cart actions so any API error is shown on the page.
  const run = async (fn) => {
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(err.message);
    }
  };

  // The API returns a Stripe Checkout URL (or our own success page when
  // Stripe isn't configured), and we send the browser there.
  const checkout = async () => {
    setBusy(true);
    setError('');
    try {
      const { url } = await api('/orders/checkout', { method: 'POST', token });
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Link to="/" className="btn-primary mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="lg:col-span-2">
        <h1 className="mb-4 text-2xl font-bold">Your cart</h1>
        {params.get('cancelled') && (
          <p className="mb-4 text-sm text-amber-700">Checkout was cancelled. Your cart is still here.</p>
        )}
        <ErrorMessage message={error} />

        <ul className="card mt-4 divide-y divide-slate-200">
          {cart.items.map(({ product, quantity }) => (
            <li key={product._id} className="flex items-center gap-4 p-4">
              <img src={product.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <Link to={`/products/${product._id}`} className="font-medium hover:underline">
                  {product.name}
                </Link>
                <p className="text-sm text-slate-500">{formatPrice(product.price)}</p>
              </div>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => run(() => updateItem(product._id, Math.max(1, Number(e.target.value))))}
                className="input w-20"
                aria-label={`Quantity of ${product.name}`}
              />
              <button
                onClick={() => run(() => removeItem(product._id))}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="card h-fit p-6">
        <h2 className="text-lg font-semibold">Summary</h2>
        <div className="mt-4 flex justify-between text-lg">
          <span>Total</span>
          <span className="font-bold">{formatPrice(cart.total)}</span>
        </div>
        <button onClick={checkout} disabled={busy} className="btn-primary mt-6 w-full">
          {busy ? 'Redirecting...' : 'Checkout'}
        </button>
        <p className="mt-3 text-xs text-slate-500">
          Payments run in Stripe test mode. Use card 4242 4242 4242 4242, any future date and any CVC.
        </p>
      </aside>
    </div>
  );
}
