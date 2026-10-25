const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const studentRepository = require('../repositories/studentRepository');
const teacherRepository = require('../repositories/teacherRepository');
const app = require('../app');

jest.mock('../repositories/studentRepository', () => ({
  findById: jest.fn(), findByEmail: jest.fn(), findAll: jest.fn(),
  create: jest.fn(), update: jest.fn(), delete: jest.fn(),
}));
jest.mock('../repositories/teacherRepository', () => ({ findById: jest.fn() }));

const originalSecret = process.env.JWT_SECRET;
const validBody = { name: 'Estudante Teste', email: 'aluno@example.com', password: 'senha123' };
let students;
let token;

beforeAll(() => { process.env.JWT_SECRET = 'student-routes-test-secret'; });
afterAll(() => {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
});

beforeEach(() => {
  jest.resetAllMocks();
  students = new Map();
  let sequence = 0;
  token = jwt.sign({ id: 1, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  teacherRepository.findById.mockResolvedValue({ id: 1, name: 'Professor', email: 'professor@example.com' });
  studentRepository.findById.mockImplementation(async (id) => students.get(Number(id)) || null);
  studentRepository.findByEmail.mockImplementation(async (email) =>
    [...students.values()].find((student) => student.email.toLowerCase() === email.toLowerCase()) || null);
  studentRepository.findAll.mockImplementation(async ({ page, limit }) => ({
    items: [...students.values()].sort((a, b) => a.id - b.id).slice((page - 1) * limit, page * limit),
    total: students.size,
  }));
  studentRepository.create.mockImplementation(async (data) => {
    const student = { id: ++sequence, ...data, createdAt: '2026-10-24T12:00:00.000Z' };
    students.set(student.id, student);
    return student;
  });
  studentRepository.update.mockImplementation(async (id, data) => {
    const student = students.get(Number(id));
    if (!student) return null;
    Object.assign(student, { name: data.name, email: data.email });
    if (data.passwordHash) student.passwordHash = data.passwordHash;
    return student;
  });
  studentRepository.delete.mockImplementation(async (id) => students.delete(Number(id)));
});

function authorized(method, path) {
  return request(app)[method](path).set('Authorization', `Bearer ${token}`);
}

describe('Student management API', () => {
  test('creates, reads, updates and deletes students without exposing credentials', async () => {
    const created = await authorized('post', '/students').send(validBody);
    expect(created.status).toBe(201);
    expect(created.body).toEqual({ id: 1, name: validBody.name, email: validBody.email, createdAt: expect.any(String) });
    expect(await bcrypt.compare(validBody.password, students.get(1).passwordHash)).toBe(true);
    expect((await authorized('get', '/students/1')).body).toEqual(created.body);
    const updated = await authorized('put', '/students/1').send({ name: 'Nome Atualizado', email: 'novo@example.com' });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ name: 'Nome Atualizado', email: 'novo@example.com' });
    expect(updated.body).not.toHaveProperty('passwordHash');
    expect(updated.body).not.toHaveProperty('password');
    expect((await authorized('delete', '/students/1')).status).toBe(200);
    expect((await authorized('get', '/students/1')).status).toBe(404);
    expect((await authorized('delete', '/students/1')).status).toBe(404);
  });

  test('supports empty lists, defaults, pagination totals and pages beyond the last page', async () => {
    expect((await authorized('get', '/students')).body).toEqual({ items: [], page: 1, limit: 10, total: 0, totalPages: 0 });
    await authorized('post', '/students').send(validBody);
    await authorized('post', '/students').send({ ...validBody, email: 'outro@example.com' });
    const page = await authorized('get', '/students?page=2&limit=1');
    expect(page.status).toBe(200);
    expect(page.body).toMatchObject({ page: 2, limit: 1, total: 2, totalPages: 2 });
    expect(page.body.items).toHaveLength(1);
    expect(page.body.items[0].id).toBe(2);
    expect(page.body.items[0]).not.toHaveProperty('passwordHash');
    expect((await authorized('get', '/students?page=3&limit=1')).body).toMatchObject({ items: [], total: 2, totalPages: 2 });
  });

  test.each(['page=0', 'page=-1', 'page=1.5', 'page=abc', 'page=1&page=2', 'limit=0', 'limit=101', 'limit=', 'limit=2.5', 'page=9007199254740991&limit=100'])(
    'rejects invalid pagination: %s', async (query) => {
      expect((await authorized('get', `/students?${query}`)).status).toBe(400);
      expect(studentRepository.findAll).not.toHaveBeenCalled();
    }
  );

  test.each([
    {}, [], { ...validBody, name: ' ' }, { ...validBody, name: 'a'.repeat(256) },
    { ...validBody, name: 1 }, { ...validBody, email: 'invalid' },
    { ...validBody, email: `${'a'.repeat(250)}@example.com` },
    { ...validBody, password: '123' }, { ...validBody, password: ' '.repeat(6) },
    { ...validBody, password: 'é'.repeat(37) }, { ...validBody, password: null },
  ])('rejects invalid student data', async (body) => {
    expect((await authorized('post', '/students').send(body)).status).toBe(400);
    expect(studentRepository.create).not.toHaveBeenCalled();
  });

  test('normalizes name and email and rejects duplicate emails on creation and update', async () => {
    const created = await authorized('post', '/students').send({ ...validBody, name: ' Teste ', email: ' ALUNO@EXAMPLE.COM ' });
    expect(created.body).toMatchObject({ name: 'Teste', email: 'aluno@example.com' });
    expect((await authorized('post', '/students').send(validBody)).status).toBe(409);
    await authorized('post', '/students').send({ ...validBody, email: 'outro@example.com' });
    expect((await authorized('put', '/students/2').send({ name: 'Outro', email: 'ALUNO@EXAMPLE.COM' })).status).toBe(409);
    expect((await authorized('put', '/students/1').send({ name: 'Mesmo', email: 'ALUNO@EXAMPLE.COM' })).status).toBe(200);
  });

  test('preserves passwords when omitted or empty and replaces them only with a valid new password', async () => {
    await authorized('post', '/students').send(validBody);
    const originalHash = students.get(1).passwordHash;
    const body = { name: validBody.name, email: validBody.email };
    await authorized('put', '/students/1').send(body);
    await authorized('put', '/students/1').send({ ...body, password: '' });
    expect(students.get(1).passwordHash).toBe(originalHash);
    expect((await authorized('put', '/students/1').send({ ...body, password: null })).status).toBe(400);
    expect(students.get(1).passwordHash).toBe(originalHash);
    const updated = await authorized('put', '/students/1').send({ ...body, password: 'outrasenha' });
    expect(updated.status).toBe(200);
    expect(updated.body).not.toHaveProperty('passwordHash');
    expect(await bcrypt.compare('outrasenha', students.get(1).passwordHash)).toBe(true);
    expect(await bcrypt.compare(validBody.password, students.get(1).passwordHash)).toBe(false);
  });

  test('ignores role and identity supplied by the client when registering a student', async () => {
    const created = await authorized('post', '/students').send({ ...validBody, id: 999, role: 'teacher' });
    expect(created.status).toBe(201);
    expect(created.body.id).toBe(1);
    expect(created.body).not.toHaveProperty('role');
    expect(students.get(1)).not.toHaveProperty('role');
  });

  test.each(['get', 'put', 'delete'])('returns 404 for an absent student on %s', async (method) => {
    expect((await authorized(method, '/students/999').send(validBody)).status).toBe(404);
  });

  test.each(['0', '-1', 'abc', '1.5', '2147483648'])('rejects invalid IDs: %s', async (id) => {
    for (const method of ['get', 'put', 'delete']) {
      expect((await authorized(method, `/students/${id}`).send(validBody)).status).toBe(400);
    }
  });

  test.each([
    ['get', '/students'], ['get', '/students/1'], ['post', '/students'],
    ['put', '/students/1'], ['delete', '/students/1'],
  ])('restricts %s %s to authenticated teachers', async (method, path) => {
    expect((await request(app)[method](path).send(validBody)).status).toBe(401);
    const student = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET);
    expect((await request(app)[method](path).set('Authorization', `Bearer ${student}`).send(validBody)).status).toBe(403);
  });

  test('rejects expired tokens and tokens of a teacher who no longer exists', async () => {
    const expired = jwt.sign({ id: 1, role: 'teacher' }, process.env.JWT_SECRET, { expiresIn: -1 });
    expect((await request(app).get('/students').set('Authorization', `Bearer ${expired}`)).status).toBe(401);
    teacherRepository.findById.mockResolvedValueOnce(null);
    expect((await authorized('get', '/students')).status).toBe(401);
  });

  test('handles unique-constraint races and database failures without leaking internal details', async () => {
    studentRepository.create.mockRejectedValueOnce({ code: '23505' });
    expect((await authorized('post', '/students').send(validBody)).status).toBe(409);
    studentRepository.findAll.mockRejectedValueOnce(new Error('private connection details'));
    const failed = await authorized('get', '/students');
    expect(failed.status).toBe(500);
    expect(JSON.stringify(failed.body)).not.toContain('private connection details');
  });
});
