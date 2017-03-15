var express = require('express');
var mongoose = require('mongoose');
var commentModel = mongoose.model('Comment');
var userModel = mongoose.model('User');
module.exports = {
    /**
     * 页码新增评论
     * @param req
     * @param res
     * @param next
     */
    insertNewCommentAtPageIndex: function (req, res, next) {
        var fileKey = req.params.fileKey;
        var pageIndex = req.params.pageIndex;
        var postOpenid = req.params.postid;
        var comment = req.body.comment;
        var criteria = {openid: postOpenid}; // 查询条件
        userModel.findOne(criteria, function (err, user) {
            if (err || user == null || user == '') {
                console.log('根据openid查询，评论用户不存在')
                res.status(404).end();
            }
            else {
                var data = new commentModel({
                    post: user,
                    comment: comment,
                    pageIndex: pageIndex,
                    fileKey: fileKey,
                });

                userModel.findOne(criteria, function (err, reply) {
                    if (err || user == null || user == '') {
                        console.log('根据openid查询，回复用户不存在')
                    }
                    else {
                        data['reply'] = reply
                    }
                    data.save(function (err, result) {
                        if (err) {
                            console.log('评论保存错误: ' + err)
                        } else {
                            console.log("保存的评论成功，结果为:" + result);
                            res.json(result);
                        }
                    });
                });
            }
        });
    },
    /**
     * 分页查看评论页面（包括回复）
     * @param req
     * @param res
     * @param next
     */
    getCommentByPage: function (req, res, next) {
        var index = req.params.sceneId;
        api.createLimitQRCode(index, function (err, result) {
            if (err)
                throw err;
            else
                res.json(api.showQRCodeURL(result.ticket));
        });
    },

}