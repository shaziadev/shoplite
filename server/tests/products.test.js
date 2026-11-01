const db = require('./db');
const { api, auth, createUser, createProduct } = require('./helpers');

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

describe('products: listing', () => {
  beforeEach(async () => {
    await createProduct({ name: 'Red Mug', category: 'home', price: 12 });
    await createProduct({ name: 'Blue Mug', category: 'home', price: 15 });
    await createProduct({ name: 'Laptop Stand', category: 'electronics', price: 40 });
  });

  it('lists products with pagination info', async () => {
    const res = await api().get('/api/products?limit=2&page=1');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBe(3);
    expect(res.body.totalPages).toBe(2);
  });

  it('filters by category and price range', async () => {
    const res = await api().get('/api/products?category=home&minPrice=13');
    expect(res.body.items.map((p) => p.name)).toEqual(['Blue Mug']);
  });

  it('searches by text', async () => {
    const res = await api().get('/api/products?search=mug');
    expect(res.body.total).toBe(2);
  });

  it('sorts by price ascending', async () => {
    const res = await api().get('/api/products?sort=price_asc');
    expect(res.body.items.map((p) => p.price)).toEqual([12, 15, 40]);
  });

  it('returns categories', async () => {
    const res = await api().get('/api/products/categories');
    expect(res.body).toEqual(['electronics', 'home']);
  });
});

describe('products: admin inventory', () => {
  const newProduct = { name: 'Desk Lamp', price: 25, category: 'home', stock: 10 };

  it('blocks non-admin users from creating products', async () => {
    const { token } = await createUser();
    const res = await api().post('/api/products').set(auth(token)).send(newProduct);
    expect(res.status).toBe(403);
  });

  it('lets an admin create, update and delete a product', async () => {
    const { token } = await createUser({ role: 'admin' });

    const created = await api().post('/api/products').set(auth(token)).send(newProduct);
    expect(created.status).toBe(201);

    const id = created.body._id;
    const updated = await api().put(`/api/products/${id}`).set(auth(token)).send({ stock: 3 });
    expect(updated.body.stock).toBe(3);

    const deleted = await api().delete(`/api/products/${id}`).set(auth(token));
    expect(deleted.status).toBe(204);

    const missing = await api().get(`/api/products/${id}`);
    expect(missing.status).toBe(404);
  });

  it('validates product fields', async () => {
    const { token } = await createUser({ role: 'admin' });
    const res = await api()
      .post('/api/products')
      .set(auth(token))
      .send({ name: '', price: -5, category: 'x', stock: 1 });
    expect(res.status).toBe(400);
  });
});
