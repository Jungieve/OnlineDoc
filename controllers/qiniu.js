var express = require('express');
var mongoose = require('mongoose');
var qiniu = require("qiniu");
var http = require("http");
var domainConfig = require('../configs/domain.json');
var qiniuConfig = require('../configs/qiniu.json');
var fileModel = mongoose.model('File');
var userModel = mongoose.model('User');
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
        var file = new fileModel(req.body);
        fileModel.find({key: req.body.key}, function (err, fileEntity) {
            if (err || fileEntity == null || fileEntity == '') {
                console.log('根据key查询，文件不存在');
                file.save();
                console.log('file信息成功保存 ....');
                userModel.findById(file.userid, function (err, userEntity) {
                    console.log(userEntity)
                    userEntity.files.push(file);
                    userEntity.save();
                    console.log('user表已经更新新的key');
                })
                res.status(200)
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
        var fileid = req.params.id;
        var fileType = req.body.type;
        var fops = "yifangyun_preview/v2/ext=" + fileType;
        fileModel.findById(fileid, function (err, fileEntity) {
            if (err)
                console.log(err)
            else {
                var opts = {
                    notifyURL: domainConfig.domain + "/qiniu/persistent/" + fileEntity.key
                }
                qiniu.fop.pfop(bucket, fileEntity.key, fops, opts, function (err, ret) {
                    if (!err) {
                        // 上传成功， 处理返回值
                        res.json({persistentId: ret.persistentId});
                    } else {
                        // 上传失败， 处理返回代码
                        res.json(err);
                    }
                })
            }
        })
    },

    /**
     * 七牛持久化回调函数
     * @param req
     * @param res
     * @param next
     */
    persistentFileCallback: function (req, res, next) {
        var items = req.body.items;
        var code = items[0].code;
        var pdfKey = items[0].key;
        if (code == 0) {
            query = {key: req.body.inputKey};
            fileModel.findOneAndUpdate(query, {$set: {code: code, pdfKey: pdfKey}}, function (err, result) {
                if (err)
                    console.log(err)
                else console.log("转成pdf回调结果为" + result)
            })
        }
        res.end();
    }
}

