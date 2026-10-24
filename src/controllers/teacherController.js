const bcrypt = require('bcryptjs');
const teacherRepository = require('../repositories/teacherRepository');

function publicTeacher({ id, name, email, createdAt }) {
  return { id, name, email, createdAt };
}

function validId(value) {
  return typeof value === 'string' && /^[1-9]\d*$/.test(value) && Number(value) <= 2147483647;
}

function validate(body, creating) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Informe os dados do professor.' };
  }
  const { name, email, password } = body;
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 255) {
    return { error: 'Nome é obrigatório e deve ter até 255 caracteres.' };
  }
  if (typeof email !== 'string' || email.trim().length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { error: 'Informe um email válido com até 255 caracteres.' };
  }
  const changingPassword = password !== undefined && password !== '';
  if ((creating || changingPassword) && (
    typeof password !== 'string' || !password.trim() || password.length < 6 || bcrypt.truncates(password)
  )) {
    return { error: 'A senha deve ter pelo menos 6 caracteres e no máximo 72 bytes.' };
  }
  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: changingPassword ? password : undefined,
  };
}

function handleError(res, error) {
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Já existe um professor com esse email.' });
  }
  return res.status(500).json({ error: 'Erro ao gerenciar professores.' });
}

class TeacherController {
  async create(req, res) {
    const data = validate(req.body, true);
    if (data.error) return res.status(400).json({ error: data.error });

    try {
      if (await teacherRepository.findByEmail(data.email)) {
        return res.status(409).json({ error: 'Já existe um professor com esse email.' });
      }
      const passwordHash = await bcrypt.hash(data.password, 10);
      const teacher = await teacherRepository.create({ name: data.name, email: data.email, passwordHash });
      return res.status(201).json(publicTeacher(teacher));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async list(req, res) {
    const { page = '1', limit = '10' } = req.query;
    const validInteger = (value) => typeof value === 'string' && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
    if (!validInteger(page) || !validInteger(limit) || Number(limit) > 100 || !Number.isSafeInteger((Number(page) - 1) * Number(limit))) {
      return res.status(400).json({ error: 'Informe page inteiro positivo e limit entre 1 e 100.' });
    }

    try {
      const result = await teacherRepository.findAll({ page: Number(page), limit: Number(limit) });
      return res.status(200).json({
        items: result.items.map(publicTeacher),
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / Number(limit)),
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async getById(req, res) {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'ID de professor inválido.' });
    try {
      const teacher = await teacherRepository.findById(req.params.id);
      if (!teacher) return res.status(404).json({ error: 'Professor não encontrado.' });
      return res.status(200).json(publicTeacher(teacher));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async update(req, res) {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'ID de professor inválido.' });
    const data = validate(req.body, false);
    if (data.error) return res.status(400).json({ error: data.error });

    try {
      const current = await teacherRepository.findById(req.params.id);
      if (!current) return res.status(404).json({ error: 'Professor não encontrado.' });
      const duplicate = await teacherRepository.findByEmail(data.email);
      if (duplicate && Number(duplicate.id) !== Number(req.params.id)) {
        return res.status(409).json({ error: 'Já existe um professor com esse email.' });
      }
      const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;
      const teacher = await teacherRepository.update(req.params.id, {
        name: data.name, email: data.email, passwordHash,
      });
      if (!teacher) return res.status(404).json({ error: 'Professor não encontrado.' });
      return res.status(200).json(publicTeacher(teacher));
    } catch (error) {
      return handleError(res, error);
    }
  }

  async delete(req, res) {
    if (!validId(req.params.id)) return res.status(400).json({ error: 'ID de professor inválido.' });
    try {
      const deleted = await teacherRepository.delete(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Professor não encontrado.' });
      return res.status(200).json({ message: 'Professor excluído com sucesso.' });
    } catch (error) {
      return handleError(res, error);
    }
  }
}

module.exports = new TeacherController();
