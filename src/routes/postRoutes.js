const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const postController = require('../controllers/postController');
const router = Router();

router.post('/posts', authMiddleware, postController.create);
router.get('/posts/search', postController.search);
router.get('/posts', postController.list);
router.get('/posts/:id', postController.getById);   
router.put('/posts/:id', authMiddleware, postController.update);
router.delete('/posts/:id', authMiddleware, postController.delete);

module.exports = router;