const pool = require('../config/database')

class TeacherRepository {
  async findByEmail(email) {
    const queryText = 'SELECT * FROM teachers WHERE email = $1'
    const { rows } = await pool.query(queryText, [email])
    return rows[0] || null
  }

  async create({ name, email, passwordHash }) {
    const queryText = `
      INSERT INTO teachers(name, email, "passwordHash")
      VALUES($1, $2, $3)
      RETURNING id, name, email, "createdAt";
    `
    const values = [name, email, passwordHash]
    const { rows } = await pool.query(queryText, values)
    return rows[0]
  }
}

module.exports = new TeacherRepository()