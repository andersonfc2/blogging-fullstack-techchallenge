const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const studentRepository = require('../repositories/studentRepository');
const teacherRepository = require('../repositories/teacherRepository');
const postRepository = require('../repositories/postRepository');
const app = require('../app');

jest.mock('../repositories/studentRepository', () => ({ findByEmail: jest.fn() }));
jest.mock('../repositories/teacherRepository', () => ({ findByEmail: jest.fn(), findById: jest.fn() }));
jest.mock('../repositories/postRepository', () => ({
  findAll: jest.fn(), findById: jest.fn(), searchPosts: jest.fn(),
  create: jest.fn(), update: jest.fn(), delete: jest.fn(),
}));

const originalSecret = process.env.JWT_SECRET;
const studentPassword = 'senha-estudante';
const teacherPassword = 'senha-professor';
const student = {
  id: 1, name: 'Estudante Teste', email: 'estudante@example.com',
  passwordHash: bcrypt.hashSync(studentPassword, 4),
};
const teacher = {
  id: 1, name: 'Professor Teste', email: 'professor@example.com',
  passwordHash: bcrypt.hashSync(teacherPassword, 4),
};
const post = { id: 1, title: 'Post educacional', content: 'Conteúdo completo', author: teacher.name };

beforeAll(() => { process.env.JWT_SECRET = 'student-auth-test-secret'; });
afterAll(() => {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
});
beforeEach(() => {
  jest.resetAllMocks();
  studentRepository.findByEmail.mockImplementation(async (email) =>
    email.toLowerCase() === student.email ? student : null);
  teacherRepository.findByEmail.mockImplementation(async (email) =>
    email.toLowerCase() === teacher.email ? teacher : null);
  teacherRepository.findById.mockResolvedValue(teacher);
  postRepository.findAll.mockResolvedValue([post]);
  postRepository.findById.mockResolvedValue(post);
  postRepository.searchPosts.mockResolvedValue([post]);
});

function loginStudent(extra = {}) {
  return request(app).post('/auth/student/login').send({
    email: student.email, password: studentPassword, ...extra,
  });
}

describe('Student authentication and read-only authorization', () => {
  test('authenticates a student with a two-hour JWT and returns no credentials', async () => {
    const response = await loginStudent({ email: ' ESTUDANTE@EXAMPLE.COM ' });
    expect(response.status).toBe(200);
    expect(response.body.student).toEqual({ id: 1, name: student.name, email: student.email, role: 'student' });
    expect(response.body).not.toHaveProperty('teacher');
    const payload = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(payload).toMatchObject({ id: 1, name: student.name, role: 'student' });
    expect(payload.exp - payload.iat).toBe(7200);
    expect(response.body.expiresAt).toBe(payload.exp * 1000);
    expect(payload).not.toHaveProperty('passwordHash');
    expect(JSON.stringify(response.body)).not.toContain(studentPassword);
    expect(JSON.stringify(response.body)).not.toContain(student.passwordHash);
    expect(teacherRepository.findByEmail).not.toHaveBeenCalled();
  });

  test.each([
    {}, { email: student.email }, { password: studentPassword },
    { email: ' ', password: studentPassword },
    { email: 123, password: studentPassword }, { email: student.email, password: 123 },
    { email: student.email, password: '' },
  ])('rejects missing or incorrectly typed credentials', async (body) => {
    expect((await request(app).post('/auth/student/login').send(body)).status).toBe(400);
    expect(studentRepository.findByEmail).not.toHaveBeenCalled();
  });

  test('uses the same generic error for an unknown email, a wrong password or a deleted student', async () => {
    const wrong = await loginStudent({ password: 'incorreta' });
    const absent = await loginStudent({ email: 'ausente@example.com' });
    expect(wrong.status).toBe(401);
    expect(absent.status).toBe(401);
    expect(absent.body).toEqual(wrong.body);
    studentRepository.findByEmail.mockResolvedValueOnce(null);
    expect((await loginStudent()).status).toBe(401);
  });

  test('never allows the request body or a repository field to grant teacher privileges', async () => {
    studentRepository.findByEmail.mockResolvedValueOnce({ ...student, role: 'teacher' });
    const response = await loginStudent({ role: 'teacher', teacher: { id: 1, role: 'teacher' } });
    expect(response.status).toBe(200);
    expect(response.body.student.role).toBe('student');
    expect(jwt.verify(response.body.token, process.env.JWT_SECRET).role).toBe('student');
  });

  test('keeps teacher login compatible and never falls back between the two account types', async () => {
    expect((await request(app).post('/auth/login').send({ email: student.email, password: studentPassword })).status).toBe(401);
    expect(studentRepository.findByEmail).not.toHaveBeenCalled();
    expect((await loginStudent({ email: teacher.email, password: teacherPassword })).status).toBe(401);
    const response = await request(app).post('/auth/login').send({ email: teacher.email, password: teacherPassword });
    expect(response.status).toBe(200);
    expect(response.body.teacher).toEqual({ id: 1, name: teacher.name, email: teacher.email, role: 'teacher' });
    expect(response.body).not.toHaveProperty('student');
  });

  test('separates profiles even when both accounts share their numeric ID and email', async () => {
    const email = 'compartilhado@example.com';
    studentRepository.findByEmail.mockResolvedValue({ ...student, email });
    teacherRepository.findByEmail.mockResolvedValue({ ...teacher, email });
    const studentLogin = await loginStudent({ email });
    const teacherLogin = await request(app).post('/auth/login').send({ email, password: teacherPassword });
    expect(studentLogin.body.student.role).toBe('student');
    expect(teacherLogin.body.teacher.role).toBe('teacher');
    expect((await request(app).post('/auth/login').send({ email, password: studentPassword })).status).toBe(401);
    expect((await loginStudent({ email, password: teacherPassword })).status).toBe(401);
  });

  test('allows students to list, search and read posts', async () => {
    const response = await loginStudent();
    const header = `Bearer ${response.body.token}`;
    expect((await request(app).get('/posts').set('Authorization', header)).body).toEqual([post]);
    expect((await request(app).get('/posts/search?term=educacional').set('Authorization', header)).body).toEqual([post]);
    expect((await request(app).get('/posts/1').set('Authorization', header)).body).toEqual(post);
  });

  test.each([
    ['post', '/posts'], ['put', '/posts/1'], ['delete', '/posts/1'],
    ['get', '/teachers'], ['get', '/teachers/1'], ['post', '/teachers'],
    ['put', '/teachers/1'], ['delete', '/teachers/1'],
    ['get', '/students'], ['get', '/students/1'], ['post', '/students'],
    ['put', '/students/1'], ['delete', '/students/1'],
  ])('rejects %s %s with an actual student login token', async (method, path) => {
    const response = await loginStudent();
    const forbidden = await request(app)[method](path)
      .set('Authorization', `Bearer ${response.body.token}`)
      .send({ name: 'Tentativa', title: 'Tentativa', content: 'Texto', author: student.name, role: 'teacher' });
    expect(forbidden.status).toBe(403);
    expect(teacherRepository.findById).not.toHaveBeenCalled();
    expect(postRepository.create).not.toHaveBeenCalled();
    expect(postRepository.update).not.toHaveBeenCalled();
    expect(postRepository.delete).not.toHaveBeenCalled();
  });

  test('rejects expired or invalid student tokens on protected endpoints', async () => {
    const expired = jwt.sign({ id: 1, role: 'student' }, process.env.JWT_SECRET, { expiresIn: -1 });
    for (const token of [expired, 'invalid-token']) {
      expect((await request(app).post('/posts').set('Authorization', `Bearer ${token}`).send({})).status).toBe(401);
    }
  });

  test('returns a generic error on a repository failure', async () => {
    studentRepository.findByEmail.mockRejectedValueOnce(new Error('private database error'));
    const response = await loginStudent();
    expect(response.status).toBe(500);
    expect(JSON.stringify(response.body)).not.toContain('private database error');
  });
});
