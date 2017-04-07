var express = require('express');
var mongoose = require('mongoose');
var dbHelper = require('../helpers/dbHelper')
var fileModel = mongoose.model('File');
var CommentModel = mongoose.model('Comment');
var UserModel = mongoose.model('User');
var redisConnection = require('../helpers/redisConnection')
module.exports = {
    /**
     * 分页获得用户文件列表
     * @param req
     * @param res
     * @param next
     */
    getUserFileListByPage: function (req, res, next) {
        var userid = req.params.id;
        var pageIndex = req.query.pageIndex;
        var pageSize = parseInt(req.query.pageSize);
        dbHelper.pageQuery(pageIndex, pageSize, fileModel, '', userid, {
            "create_at": 'desc'
        }, function (error, $page) {
            if (error)
                res.json(error)
            else
                res.json($page)
        })
    },
    /**
     * 从数据库中获取文件信息（包括转换未成功）
     * @param req
     * @param res
     * @param next
     */
    getFile: function (req, res, next) {
        var fileid = req.params.id;
        fileModel.findById(fileid, function (err, file) {
            if (err)
                res.json(err)
            else if (file == null || file == '') {
                res.json({error: "找不到该文件"}).status(404).end()
            }
            else {
                res.json(file)
            }
        })
    },
    /**
     * 删除一个文件并在数据库删除
     * @param req
     * @param res
     * @param next
     */
    deleteFile: function (req, res, next) {
        var fileid = req.params.id;
        fileModel.findByIdAndRemove(fileid).exec(function (err, file) {

            if (err) {
                res.json(err);
            }
            else if (file == null || file == '') {
                res.json({error: "Do not exist file"});
            }
            else {
                console.log(file)
                // 删除对应的评论
                CommentModel.remove({fileid: fileid}, function (err, comment) {
                    if (err)
                        console.log(err)

                })
                // 删除对应的redis comment
                redisConnection.redisClient.srem(file.userid + 'files', fileid.toString(), function (err, result) {
                    if (err) {
                        console.log(err)
                    }
                    else {
                        if (result == 0)
                            console.log("该文件所在redis已经被标记清除");
                        else {
                            console.log("该文件所在redis没有被清除");
                        }
                    }
                })
                res.json(file);
            }
        })
    }


}