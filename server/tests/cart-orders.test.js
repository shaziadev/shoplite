const db = require('./db');
const Product = require('../src/models/Product');
const { api, auth, createUser, createProduct } = require('./helpers');

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

describe('cart', () => {
  it('adds, updates and removes items and keeps the total right', async () => {
    const { token } = await createUser();
    const product = await createProduct({ price: 10, stock: 5 });
    const id = product._id.toString();

    let res = await api().post('/api/cart').set(auth(token)).send({ productId: id, quantity: 2 });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(20);

    res = await api().patch(`/api/cart/${id}`).set(auth(token)).send({ quantity: 3 });
    expect(res.body.total).toBe(30);

    res = await api().delete(`/api/cart/${id}`).set(auth(token));
    expect(res.body.items).toHaveLength(0);
  });

  it('does not allow more than the available stock', async () => {
    const { token } = await createUser();
    const product = await createProduct({ stock: 2 });
    const res = await api()
      .post('/api/cart')
      .set(auth(token))
      .send({ productId: product._id.toString(), quantity: 3 });
    expect(res.status).toBe(400);
  });
});

describe('orders & checkout (simulated Stripe)', () => {
  it('rejects checkout with an empty cart', async () => {
    const { token } = await createUser();
    const res = await api().post('/api/orders/checkout').set(auth(token));
    expect(res.status).toBe(400);
  });

  it('creates a paid order, reduces stock and clears the cart', async () => {
    const { token } = await createUser();
    const product = await createProduct({ price: 12.5, stock: 5 });
    await api().post('/api/cart').set(auth(token)).send({ productId: product._id.toString(), quantity: 2 });

    const checkout = await api().post('/api/orders/checkout').set(auth(token));
    expect(checkout.status).toBe(201);
    expect(checkout.body.simulated).toBe(true);

    const order = await api().get(`/api/orders/${checkout.body.orderId}`).set(auth(token));
    expect(order.body.status).toBe('paid');
    expect(order.body.total).toBe(25);

    expect((await Product.findById(product._id)).stock).toBe(3);
    expect((await api().get('/api/cart').set(auth(token))).body.items).toHaveLength(0);
    expect((await api().get('/api/orders/mine').set(auth(token))).body).toHaveLength(1);
  });

  it("stops users from reading other people's orders", async () => {
    const buyer = await createUser();
    const other = await createUser();
    const product = await createProduct();
    await api().post('/api/cart').set(auth(buyer.token)).send({ productId: product._id.toString() });
    const { body } = await api().post('/api/orders/checkout').set(auth(buyer.token));

    const res = await api().get(`/api/orders/${body.orderId}`).set(auth(other.token));
    expect(res.status).toBe(403);
  });

  it('lets an admin list orders and update status', async () => {
    const buyer = await createUser();
    const admin = await createUser({ role: 'admin' });
    const product = await createProduct();
    await api().post('/api/cart').set(auth(buyer.token)).send({ productId: product._id.toString() });
    const { body } = await api().post('/api/orders/checkout').set(auth(buyer.token));

    const list = await api().get('/api/orders').set(auth(admin.token));
    expect(list.body).toHaveLength(1);

    const res = await api()
      .patch(`/api/orders/${body.orderId}/status`)
      .set(auth(admin.token))
      .send({ status: 'shipped' });
    expect(res.body.status).toBe('shipped');

    const forbidden = await api().get('/api/orders').set(auth(buyer.token));
    expect(forbidden.status).toBe(403);
  });
});
