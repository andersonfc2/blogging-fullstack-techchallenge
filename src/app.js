const express = require('express');
const healthRoutes = require('./routes/healthRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API do Tech Challenge - Blogging Educacional',
  });
});

app.use(healthRoutes);
app.use(databaseRoutes);
app.use(postRoutes);

module.exports = app;
