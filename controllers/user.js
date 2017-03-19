var express = require('express');
var mongoose = require('mongoose');
var dbHelper = require('../helpers/dbHelper')
var qiniu = require("qiniu");
var fileModel = mongoose.model('File');
module.exports = {
    /**
     * 分页获得用户文件列表
     * @param req
     * @param res
     * @param next
     */
    getUserFileListByPage: function (req, res, next) {
        var userid = req.params.userid;
        var pageIndex = req.query.pageIndex;
        var pageSize = parseInt(req.query.pageSize);
        dbHelper.pageQuery(pageIndex, pageSize, fileModel, '', {userid: userid, code: 0}, {}, function (error, $page) {
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
        var userid = req.params.userid;
        var fileid = req.params.fileid;
        fileModel.findOne({key: fileid, userid: userid}, function (err, file) {
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
     * 从七牛删除一个文件并在数据库删除
     * @param req
     * @param res
     * @param next
     */
    deleteFile: function (req, res, next) {
        var userid = req.params.userid;
        var fileid = req.params.fileid;
        fileModel.findOneAndRemove({key: fileid, userid: userid}, function (err, file) {
            if (err)
                res.json(err);
            else if (file == null || file == '') {
                res.status(204).end();
            }
            else {
                res.json(file).end();
            }
        })
    }

}