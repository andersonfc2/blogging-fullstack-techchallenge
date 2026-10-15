const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const requireTeacher = require('../middlewares/requireTeacher');
const postController = require('../controllers/postController');

const router = Router();

router.get('/posts/search', postController.search);
router.get('/posts', postController.list);
router.get('/posts/:id', postController.getById);

router.post(
  '/posts',
  authMiddleware,
  requireTeacher,
  postController.create
);

router.put(
  '/posts/:id',
  authMiddleware,
  requireTeacher,
  postController.update
);

router.delete(
  '/posts/:id',
  authMiddleware,
  requireTeacher,
  postController.delete
);

module.exports = router;