const { Router } = require('express');
const postController = require('../controllers/postController');
const router = Router();

router.post('/posts', postController.create);
router.get('/posts/search', postController.search);
router.get('/posts', postController.list);
router.get('/posts/:id', postController.getById);   
router.put('/posts/:id', postController.update);    
router.delete('/posts/:id', postController.delete);

module.exports = router;