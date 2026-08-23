const pool = require('../config/database');

async function checkDatabaseConnection(req, res) {
  try {
    const result = await pool.query('SELECT NOW()');

    return res.status(200).json({
      status: 'ok',
      message: 'Banco de dados conectado com sucesso',
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Erro ao conectar no banco de dados',
    });
  }
}

module.exports = {
  checkDatabaseConnection,
};