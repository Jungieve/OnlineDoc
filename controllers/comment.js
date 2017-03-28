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
                console.log('根据openid查询，评论用户不存在')
                res.status(404).end();
            }
            else {
                var commentData = new commentModel({
                    commenter: commenterEntity,
                    comment: comment,
                    index: index,
                    fileid: fileid,
                });

                fileModel.findById(fileid, function (err, fileEntity) {
                    if (err)
                        console.log(err)
                    else if (fileEntity == null || fileEntity == '') {
                        console.log("找不到文件")
                        res.json({error: "找不到对应的评论文件"})
                    }
                    else {
                        fileEntity.comments.push(commentData);
                        fileEntity.save();
                        redisConnection.redisClient.sadd(fileEntity.userid.toString() + "files", fileEntity["_id"].toString()), function (err) {
                            if (err)
                                console.log(err)
                        };
                        commentData.commentTo = fileEntity.userid;
                        commentData.save(function (err, commentEntity) {
                            if (err) {
                                console.log('评论保存错误: ' + err)
                            } else {
                                redisConnection.redisClient.sadd(fileEntity.userid.toString() + "comments", commentEntity._id.toString()), function (err) {
                                    if (err)
                                        console.log(err)
                                };
                                console.log("保存的评论成功，结果为:" + commentEntity);
                                res.json(commentEntity);
                            }
                        });


                    }

                });

                console.log("评论成功")
                res.status(201);
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
        console.log(pageIndex)
        console.log(pageSize)
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
        dbHelper.pageQuery(pageIndex, pageSize, commentModel, '',
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

        redisConnection.redisClient.smembers(userid + 'comments', function (err, commentList) {
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
            var userid = CommentEntity.commentTo;
            var fileid = CommentEntity.fileid;
            redisConnection.redisClient.srem(userid + 'fileid', fileid.toString(), function (err, result) {
                if (err) {
                    console.log(err)
                }
                else {
                    if (result == 0)
                        console.log("没有相应的文件提醒被删除")
                    else {
                        console.log("删除对应的文件提醒" + fileid)
                    }
                }
            })
            redisConnection.redisClient.srem(userid + 'comments', commentId.toString(), function (err, result) {
                if (err) {
                    console.log(err)
                }
                else {
                    if (result == 0)
                        res.json({error: "该评论已经被标记已读"}).status(204)
                    else {
                        res.json(CommentEntity)
                    }
                }
            })
        })
    }
}