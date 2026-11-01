import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

// Filters live in the URL (?search=&category=&page=...) so results are
// shareable and the browser back button works as expected.
export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState(params.get('search') || '');

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page'); // new filter -> back to page 1
    setParams(next);
  };

  useEffect(() => {
    api('/products/categories').then(setCategories).catch(() => {});
  }, []);

  // Debounce the search box so we don't fire a request on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      if (search !== (params.get('search') || '')) updateParam('search', search.trim());
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    setData(null);
    setError('');
    api(`/products?${params.toString()}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [params]);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Shop all products</h1>
        <p className="text-sm text-slate-500">Search, filter by category or price, and sort.</p>
      </div>

      <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          className="input lg:col-span-2"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
        <select
          className="input"
          value={params.get('category') || ''}
          onChange={(e) => updateParam('category', e.target.value)}
          aria-label="Category"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            className="input"
            type="number"
            min="0"
            placeholder="Min $"
            defaultValue={params.get('minPrice') || ''}
            onBlur={(e) => updateParam('minPrice', e.target.value)}
            aria-label="Minimum price"
          />
          <input
            className="input"
            type="number"
            min="0"
            placeholder="Max $"
            defaultValue={params.get('maxPrice') || ''}
            onBlur={(e) => updateParam('maxPrice', e.target.value)}
            aria-label="Maximum price"
          />
        </div>
        <select
          className="input"
          value={params.get('sort') || 'newest'}
          onChange={(e) => updateParam('sort', e.target.value)}
          aria-label="Sort"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      <ErrorMessage message={error} />
      {!data && !error && <Spinner />}

      {data && data.items.length === 0 && (
        <p className="py-16 text-center text-slate-500">No products match your filters.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <p className="mb-3 text-sm text-slate-500">{data.total} products</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {data.items.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            onChange={(p) => updateParam('page', String(p))}
          />
        </>
      )}
    </section>
  );
}
