const { Router } = require('express');
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireTeacher = require('../middlewares/requireTeacher');

const router = Router();

router.use('/students', authMiddleware, requireTeacher);
router.get('/students', studentController.list);
router.get('/students/:id', studentController.getById);
router.post('/students', studentController.create);
router.put('/students/:id', studentController.update);
router.delete('/students/:id', studentController.delete);

module.exports = router;
