const db = require('./db');
const { api, auth } = require('./helpers');

beforeAll(db.connect);
afterEach(db.clear);
afterAll(db.close);

describe('auth', () => {
  const credentials = { name: 'Shazia', email: 'shazia@test.dev', password: 'secret123' };

  it('registers a user and returns a token without the password', async () => {
    const res = await api().post('/api/auth/register').send(credentials);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('shazia@test.dev');
    expect(res.body.user.role).toBe('user');
    expect(res.body.user.password).toBeUndefined();
  });

  it('ignores a role sent in the body (no self-promotion to admin)', async () => {
    const res = await api().post('/api/auth/register').send({ ...credentials, role: 'admin' });
    expect(res.body.user.role).toBe('user');
  });

  it('rejects duplicate emails', async () => {
    await api().post('/api/auth/register').send(credentials);
    const res = await api().post('/api/auth/register').send(credentials);
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials and loads /me', async () => {
    await api().post('/api/auth/register').send(credentials);
    const login = await api()
      .post('/api/auth/login')
      .send({ email: credentials.email, password: credentials.password });
    expect(login.status).toBe(200);

    const me = await api().get('/api/auth/me').set(auth(login.body.token));
    expect(me.status).toBe(200);
    expect(me.body.user.name).toBe('Shazia');
  });

  it('rejects a wrong password', async () => {
    await api().post('/api/auth/register').send(credentials);
    const res = await api()
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'wrong-pass' });
    expect(res.status).toBe(401);
  });
});
