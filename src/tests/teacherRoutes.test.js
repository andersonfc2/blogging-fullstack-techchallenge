const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repository = require('../repositories/teacherRepository');
const app = require('../app');

jest.mock('../repositories/teacherRepository', () => ({
  findById: jest.fn(), findByEmail: jest.fn(), findAll: jest.fn(),
  create: jest.fn(), update: jest.fn(), delete: jest.fn(),
}));

const originalSecret = process.env.JWT_SECRET;
const validBody = { name: 'Professora Teste', email: 'teste@example.com', password: 'senha123' };
let teachers;
let token;

beforeAll(() => { process.env.JWT_SECRET = 'teacher-routes-test-secret'; });
afterAll(() => {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
});

beforeEach(() => {
  jest.resetAllMocks();
  teachers = new Map([[1, {
    id: 1, name: 'Professor Inicial', email: 'inicial@example.com',
    passwordHash: bcrypt.hashSync('senha123', 4), createdAt: '2026-10-22T12:00:00.000Z',
  }]]);
  token = jwt.sign({ id: 1, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  repository.findById.mockImplementation(async (id) => teachers.get(Number(id)) || null);
  repository.findByEmail.mockImplementation(async (email) =>
    [...teachers.values()].find((teacher) => teacher.email.toLowerCase() === email.toLowerCase()) || null);
  repository.findAll.mockImplementation(async ({ page, limit }) => ({
    items: [...teachers.values()].sort((a, b) => a.id - b.id).slice((page - 1) * limit, page * limit),
    total: teachers.size,
  }));
  repository.create.mockImplementation(async (data) => {
    const teacher = { id: 2, ...data, createdAt: '2026-10-22T12:00:00.000Z' };
    teachers.set(2, teacher);
    return teacher;
  });
  repository.update.mockImplementation(async (id, data) => {
    const teacher = teachers.get(Number(id));
    if (!teacher) return null;
    Object.assign(teacher, { name: data.name, email: data.email });
    if (data.passwordHash) teacher.passwordHash = data.passwordHash;
    return teacher;
  });
  repository.delete.mockImplementation(async (id) => teachers.delete(Number(id)));
});

function authorized(method, path) {
  return request(app)[method](path).set('Authorization', `Bearer ${token}`);
}

describe('Teacher management API', () => {
  test('creates, logs in, reads, updates and deletes a teacher without exposing passwords', async () => {
    const created = await authorized('post', '/teachers').send(validBody);
    expect(created.status).toBe(201);
    expect(created.body).toEqual({ id: 2, name: validBody.name, email: validBody.email, createdAt: expect.any(String) });
    expect(await bcrypt.compare(validBody.password, teachers.get(2).passwordHash)).toBe(true);

    const login = await request(app).post('/auth/login').send({ email: ' TESTE@EXAMPLE.COM ', password: validBody.password });
    expect(login.status).toBe(200);
    const deletedTeacherToken = login.body.token;
    expect(login.body.teacher.role).toBe('teacher');

    const read = await authorized('get', '/teachers/2');
    expect(read.body).toEqual(created.body);
    const update = await authorized('put', '/teachers/2').send({ name: 'Nome Atualizado', email: 'novo@example.com' });
    expect(update.status).toBe(200);
    expect(update.body.name).toBe('Nome Atualizado');
    expect(update.body).not.toHaveProperty('passwordHash');
    expect((await request(app).post('/auth/login').send({ email: 'novo@example.com', password: validBody.password })).status).toBe(200);

    expect((await authorized('delete', '/teachers/2')).status).toBe(200);
    expect((await authorized('get', '/teachers/2')).status).toBe(404);
    expect((await request(app).post('/auth/login').send({ email: 'novo@example.com', password: validBody.password })).status).toBe(401);
    expect((await request(app).get('/teachers').set('Authorization', `Bearer ${deletedTeacherToken}`)).status).toBe(401);
    expect((await request(app).post('/posts').set('Authorization', `Bearer ${deletedTeacherToken}`).send({})).status).toBe(401);
  });

  test('paginates results, reports totals, and returns an empty page beyond the last page', async () => {
    await authorized('post', '/teachers').send(validBody);
    const page = await authorized('get', '/teachers?page=2&limit=1');
    expect(page.status).toBe(200);
    expect(page.body).toMatchObject({ page: 2, limit: 1, total: 2, totalPages: 2 });
    expect(page.body.items).toHaveLength(1);
    expect(page.body.items[0].id).toBe(2);
    expect(page.body.items[0]).not.toHaveProperty('passwordHash');
    const empty = await authorized('get', '/teachers?page=3&limit=1');
    expect(empty.body).toMatchObject({ items: [], total: 2, totalPages: 2 });
    expect((await authorized('get', '/teachers')).body).toMatchObject({ page: 1, limit: 10 });
  });

  test.each(['page=0', 'page=-1', 'page=1.5', 'page=abc', 'page=1&page=2', 'limit=0', 'limit=101', 'limit=', 'limit=2.5', 'page=9007199254740991&limit=100'])(
    'rejects invalid pagination: %s', async (query) => {
      expect((await authorized('get', `/teachers?${query}`)).status).toBe(400);
      expect(repository.findAll).not.toHaveBeenCalled();
    }
  );

  test.each([
    {}, { ...validBody, name: ' ' }, { ...validBody, name: 'a'.repeat(256) },
    { ...validBody, email: 'invalid' }, { ...validBody, password: '123' },
    { ...validBody, password: ' '.repeat(6) }, { ...validBody, password: 'é'.repeat(37) },
    { ...validBody, password: null }, { ...validBody, name: 123 },
  ])('rejects invalid teacher data', async (body) => {
    expect((await authorized('post', '/teachers').send(body)).status).toBe(400);
    expect(repository.create).not.toHaveBeenCalled();
  });

  test('normalizes names and email, detects case-insensitive duplicate emails on create and update', async () => {
    const created = await authorized('post', '/teachers').send({ ...validBody, name: ' Teste ', email: ' TESTE@EXAMPLE.COM ' });
    expect(created.body).toMatchObject({ name: 'Teste', email: 'teste@example.com' });
    expect((await authorized('post', '/teachers').send(validBody)).status).toBe(409);
    expect((await authorized('put', '/teachers/2').send({ name: 'Teste', email: 'INICIAL@EXAMPLE.COM' })).status).toBe(409);
    expect((await authorized('put', '/teachers/2').send({ name: 'Teste', email: 'TESTE@EXAMPLE.COM' })).status).toBe(200);
  });

  test('preserves a password when omitted or empty and hashes a new password when provided', async () => {
    await authorized('post', '/teachers').send(validBody);
    const originalHash = teachers.get(2).passwordHash;
    const updateBody = { name: 'Teste', email: validBody.email };
    await authorized('put', '/teachers/2').send(updateBody);
    await authorized('put', '/teachers/2').send({ ...updateBody, password: '' });
    expect(teachers.get(2).passwordHash).toBe(originalHash);
    expect((await authorized('put', '/teachers/2').send({ ...updateBody, password: 'outrasenha' })).status).toBe(200);
    expect(await bcrypt.compare('outrasenha', teachers.get(2).passwordHash)).toBe(true);
    expect(await bcrypt.compare(validBody.password, teachers.get(2).passwordHash)).toBe(false);
  });

  test.each(['get', 'put', 'delete'])('returns 404 for an absent teacher on %s', async (method) => {
    expect((await authorized(method, '/teachers/999').send(validBody)).status).toBe(404);
  });

  test.each(['0', '-1', 'abc', '1.5', '2147483648'])('rejects invalid IDs: %s', async (id) => {
    for (const method of ['get', 'put', 'delete']) {
      expect((await authorized(method, `/teachers/${id}`).send(validBody)).status).toBe(400);
    }
  });

  test.each([
    ['get', '/teachers'], ['get', '/teachers/1'], ['post', '/teachers'],
    ['put', '/teachers/1'], ['delete', '/teachers/1'],
  ])('requires authentication and teacher authorization for %s %s', async (method, path) => {
    expect((await request(app)[method](path).send(validBody)).status).toBe(401);
    const student = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET);
    expect((await request(app)[method](path).set('Authorization', `Bearer ${student}`).send(validBody)).status).toBe(403);
  });

  test('rejects expired tokens and tokens of deleted teachers', async () => {
    const expired = jwt.sign({ id: 1, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: -1 });
    expect((await request(app).get('/teachers').set('Authorization', `Bearer ${expired}`)).status).toBe(401);
    teachers.delete(1);
    expect((await authorized('get', '/teachers')).status).toBe(401);
  });

  test('keeps post creation behind authentication and teacher authorization', async () => {
    // The existing post controller rejects the empty body only after authorization succeeds.
    expect((await authorized('post', '/posts').send({})).status).toBe(400);
    const student = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET);
    expect((await request(app).post('/posts').set('Authorization', `Bearer ${student}`).send({})).status).toBe(403);
    expect((await request(app).post('/posts').send({})).status).toBe(401);
  });

  test('handles unique-constraint races and database failures without exposing internal details', async () => {
    repository.create.mockRejectedValueOnce({ code: '23505' });
    expect((await authorized('post', '/teachers').send(validBody)).status).toBe(409);
    repository.findAll.mockRejectedValueOnce(new Error('private database details'));
    const failed = await authorized('get', '/teachers');
    expect(failed.status).toBe(500);
    expect(JSON.stringify(failed.body)).not.toContain('private database details');
    repository.findById.mockRejectedValueOnce(new Error('connection failed'));
    expect((await authorized('get', '/teachers')).status).toBe(500);
  });
});
