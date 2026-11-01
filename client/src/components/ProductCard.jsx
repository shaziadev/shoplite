import { Link } from 'react-router-dom';
import { formatPrice } from '../api/client';

export default function ProductCard({ product }) {
  return (
    <Link to={`/products/${product._id}`} className="card group overflow-hidden transition hover:shadow-md">
      <div className="aspect-square overflow-hidden bg-slate-100">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">{product.category}</p>
        <h3 className="mt-1 font-semibold">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-indigo-600">{formatPrice(product.price)}</span>
          {product.stock === 0 && <span className="text-xs text-red-600">Out of stock</span>}
        </div>
      </div>
    </Link>
  );
}
