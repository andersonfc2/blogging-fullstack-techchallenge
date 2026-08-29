const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const teacherRepository = require('../repositories/teacherRepository')

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' })
      }

      const teacher = await teacherRepository.findByEmail(email)

      if (!teacher) {
        return res.status(401).json({ error: 'Credenciais inválidas.' })
      }

      const passwordMatches = await bcrypt.compare(password, teacher.passwordHash)

      if (!passwordMatches) {
        return res.status(401).json({ error: 'Credenciais inválidas.' })
      }

      const token = jwt.sign(
        {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      )

      return res.status(200).json({
        token,
        teacher: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
        },
      })
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao realizar login.' })
    }
  }
}

module.exports = new AuthController()