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
        var openid = req.params.openid;
        var pageIndex = req.query.pageIndex;
        var pageSize = parseInt(req.query.pageSize);
        dbHelper.pageQuery(pageIndex, pageSize, fileModel, '', {userid: openid, code: 0}, {}, function (error, $page) {
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
        var userid = req.params.openid;
        var key = req.params.key;
        console.log("当前文件key值:" + key)
        var criteria = {key: key, userid: userid}; // 查询条件
        fileModel.findOne(criteria, function (err, file) {
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
        var client = new qiniu.rs.Client();
        var userid = req.params.openid;
        var key = req.params.key;

        var criteria = {key: key, userid: userid}; // 查询条件
        fileModel.findOneAndRemove(criteria, function (err, file) {
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