const router = require('express').Router();
const postController = require('../controllers/post.controller');
const { route } = require('./user.routes');
const multer = require('multer');
const upload = multer();

router.get('/', postController.readPost);
router.post('/', upload.single('file'), postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.delePost);
router.patch('/like-post/:id', postController.likePost);
router.patch('/unlike-post/:id', postController.unlikePost);


// comments
router.patch('/comment-post/:id', postController.commentPost);
router.patch('/edit-comment-post/:id', postController.editCommentPost);
router.delete('/delete-comment-post/:id', postController.deleteCommentPost);

module.exports = router 