var express = require('express');
var mongoose = require('mongoose');
var dbHelper = require('../helpers/dbHelper')
var redisConnection = require('../helpers/redisConnection')
var userModel = mongoose.model('User');
var fileModel = mongoose.model('File');
var commentModel = mongoose.model('Comment')


module.exports = {
    /**
     * 页码新增评论
     * @param req
     * @param res
     * @param next
     */
    insertNewCommentAtPageIndex: function (req, res, next) {
        var fileid = req.params.id;
        var index = req.params.index;
        var commenter = req.body.commenterid;
        var comment = req.body.comment;
        userModel.findById(commenter, function (err, commenterEntity) {
            if (err || commenterEntity == null || commenterEntity == '') {
                res.json({error: "评论用户不存在"})
            }
            else {
                var commentData = new commentModel({
                    commenter: commenterEntity,
                    comment: comment,
                    index: index,
                    fileid: fileid,
                });
                fileModel.findById(fileid, function (err, fileEntity) {
                    if (err || fileEntity == null || fileEntity == '')
                        res.json({error: "找不到对应的评论文件"})
                    else {
                        commentData.commentTo = fileEntity.userid;
                        commentData.save(function (err, commentEntity) {
                            if (err)
                                console.log('评论保存错误: ' + err)
                            else
                                redisConnection.redisClient.hset(fileEntity.userid.toString() + "comments", commentEntity._id.toString(), fileEntity["_id"].toString(), function (err, result) {
                                    if (err)
                                        console.log(err)
                                    else console.log(result)
                                });
                            res.json(commentEntity).status(201);
                        });
                    }
                });
            }
        });
    },
    /**
     * 分页查看评论页面（包括回复）
     * @param filekey: 文件key值
     * @param index: 文件索引
     * @param pageIndex: 分页索引
     * @param pageSize: 分页尺寸
     */
    getCommentListByPage: function (req, res, next) {
        var fileid = req.params.id;
        var index = req.params.index;
        var pageIndex = req.query.pageIndex;
        var pageSize = parseInt(req.query.pageSize);

        dbHelper.pageQuery(pageIndex, pageSize, commentModel, 'commenter',
            {
                fileid: fileid,
                index: index
            },
            {
                created_time: 'desc'
            }, function (error, $page) {
                if (error)
                    res.json(error)
                else
                    res.json($page)
            })
    },
    /**
     * 查看某个用户拥有的所有评论记录
     * @param filekey: 文件key值
     * @param index: 文件索引
     * @param pageIndex: 分页索引
     * @param pageSize: 分页尺寸
     */
    getUserCommentListByPage: function (req, res, next) {
        var userid = req.params.id;
        var pageIndex = req.query.pageIndex;
        var pageSize = parseInt(req.query.pageSize);
        dbHelper.pageQuery(pageIndex, pageSize, commentModel, 'commenter fileid',
            {
                commentTo: userid
            }, {
                "create_at": 'desc'
            }, function (error, $page) {
                if (error)
                    res.json(error)
                else
                    res.json($page)
            })

    },

    getUnviewedCommentList: function (req, res, next) {
        var userid = req.params.id;
        var pageIndex = req.query.pageIndex;
        var pageSize = parseInt(req.query.pageSize);

        redisConnection.redisClient.hkeys(userid + 'comments', function (err, commentList) {
            if (err) {
                console.log(err)
                throw err;
            }
            console.log("commentList" + commentList)
            dbHelper.pageQuery(pageIndex, pageSize, commentModel, '', {_id: commentList}, {
                    "create_at": 'desc'
                }
                , function (error, $page) {
                    if (error)
                        res.json(error)
                    else
                        res.json($page)
                })
        })
    },

    markUnviewedComment: function (req, res, next) {
        var commentId = req.params.id;
        commentModel.findById(commentId, function (err, CommentEntity) {
            if (err || CommentEntity == null)
                res.json({error: "找不到对应评论id"})
            else {
                var userid = CommentEntity.commentTo;
                redisConnection.redisClient.srem(userid + 'comments', commentId.toString(), function (err, result) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        if (result == 0)
                            res.json({error: "该评论已经被标记未读"}).status(204)
                        else {
                            res.json(CommentEntity)
                        }
                    }
                })
            }
        })
    },
    /**
     * 查看某个用户对该用户发起的评论
     * @param id: 用户id
     * @param commenterid: 评论人id
     */
    getUserCommentListAtCertainCommenterByPage: function (req, res, next) {
        var userid = req.params.id;
        var commenterid = req.params.commenterid;
        var begindate = req.query.begindate || '1970-01-01';
        var enddate = req.query.enddate || '2038-01-01';
        var pageIndex = req.query.pageIndex;
        var pageSize = parseInt(req.query.pageSize);
        console.log(begindate)
        console.log(enddate)
        dbHelper.pageQuery(pageIndex, pageSize, commentModel, 'commenter fileid',
            {
                commenter: commenterid,
                commentTo: userid,
                create_at: {"$gte": new Date(begindate), "$lte": new Date(enddate)}
            }, {
                "create_at": 'desc'
            }, function (error, $page) {
                if (error) {
                    console.log(error)
                    res.json({error: "错误的查询条件"})
                }

                else
                    res.json($page)
            })

    }
}