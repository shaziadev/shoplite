import { useEffect, useState } from 'react';
import { api, formatPrice } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';

const EMPTY_FORM = { name: '', price: '', category: '', stock: '', image: '', description: '' };

// Admin-only page: list, create, edit and delete products.
export default function AdminInventoryPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api(`/products?limit=10&page=${page}&sort=name`)
      .then(setData)
      .catch((err) => setError(err.message));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      category: p.category,
      stock: p.stock,
      image: p.image || '',
      description: p.description || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) {
        await api(`/products/${editingId}`, { method: 'PUT', body, token });
      } else {
        await api('/products', { method: 'POST', body, token });
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await api(`/products/${p._id}`, { method: 'DELETE', token });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-bold">Inventory</h1>

      <form onSubmit={handleSubmit} className="card grid gap-3 p-6 sm:grid-cols-2">
        <h2 className="font-semibold sm:col-span-2">{editingId ? 'Edit product' : 'Add a product'}</h2>
        <input className="input" name="name" placeholder="Name" required value={form.name} onChange={handleChange} />
        <input className="input" name="category" placeholder="Category" required value={form.category} onChange={handleChange} />
        <input className="input" name="price" type="number" step="0.01" min="0" placeholder="Price" required value={form.price} onChange={handleChange} />
        <input className="input" name="stock" type="number" min="0" placeholder="Stock" required value={form.stock} onChange={handleChange} />
        <input className="input sm:col-span-2" name="image" type="url" placeholder="Image URL" value={form.image} onChange={handleChange} />
        <textarea className="input sm:col-span-2" name="description" rows="3" placeholder="Description" value={form.description} onChange={handleChange} />
        <div className="sm:col-span-2"><ErrorMessage message={error} /></div>
        <div className="flex gap-2 sm:col-span-2">
          <button className="btn-primary">{editingId ? 'Save changes' : 'Add product'}</button>
          {editingId && <button type="button" className="btn-outline" onClick={resetForm}>Cancel</button>}
        </div>
      </form>

      {!data ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data.items.map((p) => (
                <tr key={p._id}>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 capitalize">{p.category}</td>
                  <td className="p-3">{formatPrice(p.price)}</td>
                  <td className={`p-3 ${p.stock < 5 ? 'font-semibold text-red-600' : ''}`}>{p.stock}</td>
                  <td className="space-x-3 p-3 text-right">
                    <button onClick={() => startEdit(p)} className="text-indigo-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {data && <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />}
    </section>
  );
}
