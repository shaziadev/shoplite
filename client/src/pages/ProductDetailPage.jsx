import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, formatPrice } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api(`/products/${id}`).then(setProduct).catch((err) => setError(err.message));
  }, [id]);

  const handleAdd = async () => {
    if (!user) return navigate('/login', { state: { from: `/products/${id}` } });
    setError('');
    try {
      await addItem(id, quantity);
      setMessage('Added to your cart.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !product) return <ErrorMessage message={error} />;
  if (!product) return <Spinner />;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="card overflow-hidden">
        {product.image && <img src={product.image} alt={product.name} className="w-full object-cover" />}
      </div>

      <div>
        <Link to="/" className="text-sm text-indigo-600">← Back to shop</Link>
        <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">{product.category}</p>
        <h1 className="mt-1 text-3xl font-bold">{product.name}</h1>
        <p className="mt-3 text-2xl font-semibold text-indigo-600">{formatPrice(product.price)}</p>
        <p className="mt-4 text-slate-600">{product.description}</p>
        <p className="mt-4 text-sm text-slate-500">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>

        {product.stock > 0 && (
          <div className="mt-6 flex items-center gap-3">
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="input w-24"
              aria-label="Quantity"
            />
            <button onClick={handleAdd} className="btn-primary">Add to cart</button>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <ErrorMessage message={error} />
          {message && (
            <p className="text-sm text-green-700">
              {message} <Link to="/cart" className="underline">View cart</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
