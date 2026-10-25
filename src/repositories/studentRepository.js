const pool = require('../config/database');

class StudentRepository {
  async findByEmail(email) {
    const { rows } = await pool.query(
      'SELECT * FROM students WHERE LOWER(email) = LOWER($1)', [email]
    );
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT id, name, email, "createdAt" FROM students WHERE id = $1', [id]
    );
    return rows[0] || null;
  }

  async findAll({ page, limit }) {
    const [result, count] = await Promise.all([
      pool.query(
        'SELECT id, name, email, "createdAt" FROM students ORDER BY id ASC LIMIT $1 OFFSET $2',
        [limit, (page - 1) * limit]
      ),
      pool.query('SELECT COUNT(*)::int AS total FROM students'),
    ]);
    return { items: result.rows, total: count.rows[0].total };
  }

  async create({ name, email, passwordHash }) {
    const { rows } = await pool.query(
      `INSERT INTO students(name, email, "passwordHash") VALUES($1, $2, $3)
       RETURNING id, name, email, "createdAt"`,
      [name, email, passwordHash]
    );
    return rows[0];
  }

  async update(id, { name, email, passwordHash = null }) {
    const { rows } = await pool.query(
      `UPDATE students
       SET name = $1, email = $2, "passwordHash" = COALESCE($3, "passwordHash")
       WHERE id = $4
       RETURNING id, name, email, "createdAt"`,
      [name, email, passwordHash, id]
    );
    return rows[0] || null;
  }

  async delete(id) {
    const { rows } = await pool.query('DELETE FROM students WHERE id = $1 RETURNING id', [id]);
    return rows.length > 0;
  }
}

module.exports = new StudentRepository();
