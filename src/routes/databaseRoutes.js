const express = require('express');
const { checkDatabaseConnection } = require('../controllers/databaseController');

const router = express.Router();

router.get('/database/health', checkDatabaseConnection);

module.exports = router;