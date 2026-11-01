// These tests don't touch the database: they cover health, 404s,
// request validation and auth guards that run before any query.
const { api, auth } = require('./helpers');

describe('app basics', () => {
  it('GET /api/health returns ok', async () => {
    const res = await api().get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('unknown routes return 404 JSON', async () => {
    const res = await api().get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Route not found/);
  });

  it('register validates the body', async () => {
    const res = await api().post('/api/auth/register').send({ email: 'bad', password: '1' });
    expect(res.status).toBe(400);
    const fields = res.body.details.map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });

  it('protected routes reject missing or bad tokens', async () => {
    expect((await api().get('/api/cart')).status).toBe(401);
    expect((await api().get('/api/cart').set(auth('not-a-jwt'))).status).toBe(401);
  });

  it('rejects invalid product ids before querying', async () => {
    const res = await api().get('/api/products/123');
    expect(res.status).toBe(400);
  });

  it('webhook refuses requests when Stripe is not configured', async () => {
    const res = await api().post('/api/webhooks/stripe').send({});
    expect(res.status).toBe(400);
  });
});
