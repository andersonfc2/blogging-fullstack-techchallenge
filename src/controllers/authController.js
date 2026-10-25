const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const teacherRepository = require('../repositories/teacherRepository');
const studentRepository = require('../repositories/studentRepository');

async function authenticate(req, res, repository, role, responseKey) {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    const account = await repository.findByEmail(email.trim());
    if (!account || !await bcrypt.compare(password, account.passwordHash)) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // The endpoint defines the role; client-supplied profile fields are ignored.
    const user = { id: account.id, name: account.name, email: account.email, role };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '2h' });
    const expiresAt = jwt.decode(token).exp * 1000;
    return res.status(200).json({ token, expiresAt, [responseKey]: user });
  } catch {
    return res.status(500).json({ error: 'Erro ao realizar login.' });
  }
}

class AuthController {
  login(req, res) {
    return authenticate(req, res, teacherRepository, 'teacher', 'teacher');
  }

  loginStudent(req, res) {
    return authenticate(req, res, studentRepository, 'student', 'student');
  }
}

module.exports = new AuthController();
