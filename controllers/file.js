var express = require('express');
var mongoose = require('mongoose');
var qiniu = require("qiniu");
var qiniuConfig = require('../configs/qiniu.json')
var domainConfig = require('../configs/domain.json')
var fileModel = mongoose.model('File');
//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = qiniuConfig.accessKey;
qiniu.conf.SECRET_KEY = qiniuConfig.secretKey;

//要上传的空间
bucket = qiniuConfig.bucket;

module.exports = {
    /**
     * 获取七牛token
     * @param req
     * @param res
     * @param next
     */
    getToken: function (req, res, next) {
        var putPolicy = new qiniu.rs.PutPolicy(bucket);
        putPolicy.callbackUrl = 'http://' + domainConfig.domain + '/files/upload/callback';
        putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)&fileType=$(mimeType)' +
            '&bucket=$(bucket)&key=$(key)' +
            '&userid=$(x:userid)';
        res.json(({token: putPolicy.token()}))
    },
    /**
     * 七牛上传成功回调方法（写入数据库）
     * @param req
     * @param res
     * @param next
     */
    uploadCallback: function (req, res, next) {
        console.log("文件上传成功");
        var file = new fileModel(req.body);
        var criteria = {key: req.body.key}; // 查询条件
        console.log(criteria)
        fileModel.find(criteria, function (err, result) {
            if (err || result == null || result == '') {
                console.log('根据key查询，文件不存在');
                file.save(function (err, result) {
                    if (err) {
                        console.log('file信息保存错误 ....');
                        console.log('error: ' + err)
                    } else {
                        console.log('file信息成功保存 ....');
                        console.log("保存的用户结果为:" + result);
                    }
                });
                res.status(201)
            }
            res.json(file);
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
        var key = req.params.key;
        console.log(key)
        client.remove(bucket, key, function (err, ret) {
            if (!err) {
                // ok
                var criteria = {key: key}; // 查询条件
                fileModel.findOneAndRemove(criteria, function (err, file) {
                    if (err || file == null || file == '') {
                        res.status(204).end();
                    }
                    else {
                        res.json(file)
                    }

                })
            } else {
                console.log(err);
            }
        });
        res.end();
    },



}

