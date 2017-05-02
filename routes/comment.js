var express = require('express');
var router = express.Router();
var commentController = require('../controllers/comment');

//插入新的评论（包括回复）
router.post('/file/:id/:index/', commentController.insertNewCommentAtPageIndex);
//分页获取某个文件评论列表
router.get('/file/:id/:index/list', commentController.getCommentListByPage);

//分页获取某个用户所拥有的评论列表
router.post('/user/:id/list', commentController.getUserCommentListByPage);

//分页获取某个用户所拥有的未读评论列表
router.post('/user/:id/unviewed/list', commentController.getUnviewedCommentList);

//分页获取某个用户下的单个评论人发起过的评论
router.get('/user/:id/by/commenter/list', commentController.getUserCommentListAtCertainCommenterByPage);

module.exports = router;
