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
        putPolicy.callbackUrl = 'http://' + domainConfig.domain + '/qiniu/upload/callback';
        putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)&fileType=$(mimeType)' +
            '&bucket=$(bucket)&key=$(key)' +
            '&userid=$(x:userid)&note=$(x:note)';
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


}

