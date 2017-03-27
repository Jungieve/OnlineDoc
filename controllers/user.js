var express = require('express');
var mongoose = require('mongoose');
var dbHelper = require('../helpers/dbHelper')
var fileModel = mongoose.model('File');
var CommentModel = mongoose.model('Comment');
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
                res.status(404).end()
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
        fileModel.findById(fileid).exec(function (err, file) {
            CommentModel.remove(file.comments, function (err) {
                if (err)
                    console.log(err)
            })
            if (err) {
                res.json(err);
            }
            else if (file == null || file == '') {
                res.json({error: "Do not exist file"});
            }
            else {
                console.log(file)
                res.json(file);
            }
        })
    }


}