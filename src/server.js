require('dotenv').config();

const app = require('./app');
const { initDatabase } = require('./config/database');

const port = process.env.PORT || 3000;

async function startServer() {
  await initDatabase();

  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Erro ao iniciar o servidor:', error);
  process.exit(1);
});
