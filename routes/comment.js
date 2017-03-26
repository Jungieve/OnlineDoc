var express = require('express');
var router = express.Router();
var commentController = require('../controllers/comment');

//插入新的评论（包括回复）
router.post('/file/:id/:index/', commentController.insertNewCommentAtPageIndex);
//分页获取某个文件评论列表
router.get('/file/:id/:index/list', commentController.getCommentListByPage);

//分页获取某个用户所拥有的评论列表
router.get('/user/:id/list', commentController.getUserCommentListByPage);

//分页获取某个用户所拥有的评论列表
router.get('/user/:id/unviewed/list', commentController.getUnviewedCommentList);
module.exports = router;
