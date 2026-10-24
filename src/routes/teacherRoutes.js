const { Router } = require('express');
const teacherController = require('../controllers/teacherController');
const authMiddleware = require('../middlewares/authMiddleware');
const requireTeacher = require('../middlewares/requireTeacher');

const router = Router();

router.use('/teachers', authMiddleware, requireTeacher);
router.get('/teachers', teacherController.list);
router.get('/teachers/:id', teacherController.getById);
router.post('/teachers', teacherController.create);
router.put('/teachers/:id', teacherController.update);
router.delete('/teachers/:id', teacherController.delete);

module.exports = router;
