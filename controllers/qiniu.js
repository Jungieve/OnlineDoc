var express = require('express');
var mongoose = require('mongoose');
var qiniu = require("qiniu");
var http = require("http");
var domainConfig = require('../configs/domain.json')
var qiniuConfig = require('../configs/qiniu.json')
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

    /**
     * 七牛持久化文件流程
     * @param req
     * @param res
     * @param next
     */
    persistentFile: function (req, res, next) {
        var key = req.params.key;
        var fileType = req.query.type;
        var fops = "yifangyun_preview/v2/ext=" + fileType;
        var notifyURL = domainConfig.domain + "/qiniu/persistent/" + key;
        opts = {
            notifyURL: notifyURL
        };
        var PFOP = qiniu.fop.pfop(bucket, key, fops, opts, function (err, ret) {
            if (!err) {
                // 上传成功， 处理返回值
                res.json({persistentId: ret.persistentId});
            } else {
                // 上传失败， 处理返回代码
                res.json(err);
            }
        });
    },

    /**
     * 七牛持久化回调函数
     * @param req
     * @param res
     * @param next
     */
    persistentFileCallback: function (req, res, next) {
        console.log(req.body)
        var items = req.body.items;
        var code = items[0].code;
        var pdfKey = items[0].key;
        if (code == 0) {
            query = {key: req.body.inputKey};
            console.log(query)
            fileModel.findOneAndUpdate(query, {$set: {code: code, pdfKey: pdfKey}}, function (err, result) {
                if (err)
                    console.log(err)
                else console.log(result)
            })
        }
        res.end();
    }
}

