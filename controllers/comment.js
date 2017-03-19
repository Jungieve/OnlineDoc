var express = require('express');
var mongoose = require('mongoose');
var dbHelper = require('../helpers/dbHelper')
var commentModel = mongoose.model('Comment');
var userModel = mongoose.model('User');
var fileModel = mongoose.model('File');
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
        userModel.findById(commenter, function (err, userEntity) {
            if (err || userEntity == null || userEntity == '') {
                console.log('根据openid查询，评论用户不存在')
                res.status(404).end();
            }
            else {
                var commentData = new commentModel({
                    commenter: userEntity,
                    comment: comment,
                    index: index,
                    fileid: fileid,
                });

                commentData.save(function (err, result) {
                    if (err) {
                        console.log('评论保存错误: ' + err)
                    } else {
                        console.log("保存的评论成功，结果为:" + result);
                        res.json(result);
                    }
                });
                fileModel.findById(fileid, function (err, fileEntity) {
                    if (err)
                        console.log(err)
                    else {
                        fileEntity.comments.push(commentData);
                        fileEntity.save();
                    }
                });
                userEntity.comments.push(commentData);
                userEntity.save();
                console.log("评论保存时用户实体也进行了更新")
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
        userModel.findById(userid, function (err, userEntity) {
            if (err)
                res.json(err);

            dbHelper.pageQuery(pageIndex, pageSize, userModel, 'comments',
                '', '', function (error, $page) {
                    if (error)
                        res.json(error)
                    else
                        res.json($page)
                })
        })

    }
}