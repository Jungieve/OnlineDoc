var express = require('express');
var router = express.Router();
var commentController = require('../controllers/comment');

router.post('/:fileKey/:pageIndex/:postid/', commentController.insertNewCommentAtPageIndex);
// router.post('/:filekey/:pageIndex/:commentid/:replyid/replyTo/:originid', indexController.checkSignature);
module.exports = router;
