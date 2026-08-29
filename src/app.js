const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const postRoutes = require('./routes/postRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API do Tech Challenge - Blogging Educacional',
  });
});

app.use(healthRoutes);
app.use(databaseRoutes);
app.use(authRoutes);
app.use(postRoutes);

module.exports = app;
