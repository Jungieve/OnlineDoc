var express = require('express');
var mongoose = require('mongoose');
var qiniu = require("qiniu");
var http = require("http");
var domainConfig = require('../configs/domain.json');
var qiniuConfig = require('../configs/qiniu.json');
var fileModel = mongoose.model('File');
var userModel = mongoose.model('User');
var CommentModel = mongoose.model('Comment');
var redisConnection = require('../helpers/redisConnection')
var request = require('request')
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
        var fileType = req.query.type;
        var putPolicy = new qiniu.rs.PutPolicy(bucket);
        putPolicy.persistentNotifyUrl = domainConfig.domain + "/qiniu/persistent/file";
        putPolicy.persistentOps ="yifangyun_preview/v2/ext=" + fileType;
        putPolicy.persistentPipeline = 'xunzhu_pipeline';
        putPolicy.callbackUrl = 'http://' + domainConfig.domain + '/qiniu/upload/callback';
        putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)&fileType=$(mimeType)' +
            '&bucket=$(bucket)&key=$(key)' +
            '&userid=$(x:userid)&note=$(x:note)';
        res.json(({uptoken: putPolicy.token()}))
    },
    /**
     * 七牛上传成功回调方法（写入数据库）
     * @param req
     * @param res
     * @param next
     */
    uploadCallback: function (req, res, next) {
        var file = new fileModel(req.body);
        console.log(req.body)
        fileModel.find({key: req.body.key}, function (err, fileEntity) {
            if (err) {
                console.log(err)
                res.json(err)
            }
            else {
                userModel.findById(file.userid, function (err, userEntity) {
                    if (userEntity == null) {
                        console.log("查询不到目标用户")
                        res.json({error: "目标用户不存在"}).status(204);
                    }
                    else {
                        if (fileEntity == null || fileEntity == '') {
                            console.log('根据key查询，文件不存在,尝试重新生成');
                            file.save();
                            console.log('file信息成功保存 ....');
                        }
                        else {
                            console.log("数据库已经有这个文件了")
                            fileModel.update({_id: fileEntity._id}, file, function (err) {
                                if (err)
                                    console.log(err)
                            })

                        }
                        res.json(file)
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
        query = {key: req.body.inputKey};
        console.log("code" + code + ' query:' + query.toString())
        fileModel.findOne(query, {$set: {code: code, pdfKey: pdfKey}}, function (err, fileEntity) {
            if (err || fileEntity == null) {
                console.log('找不到回调的目标用户' + err);
            }
            redisConnection.redisClient.hset(fileEntity.userid.toString() + "qiniu", fileEntity._id.toString(), code);
            switch (code) {
                case 0: {
                    fileEntity.pdfKey = pdfKey;
                    fileEntity.save();
                    console.log("成功转换,转成pdf回调结果为" + fileEntity)
                    res.status(201);
                    break;
                }
                case 3:
                case 4: {
                    console.log("七牛失败code:" + code + "它的query是" + query.toString());
                    fileEntity.remove();
                    res.status(204);
                }
                default:
                    res.status(202);
            }
        })
    }
}

