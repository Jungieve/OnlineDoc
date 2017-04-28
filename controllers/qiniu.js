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
        var putPolicy = new qiniu.rs.PutPolicy(bucket);
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
     * 七牛持久化文件流程
     * @param req
     * @param res
     * @param next
     */
    persistentFile: function (req, res, next) {
        var fileid = req.body.id;
        var fileType = req.body.type;
        var fops = "yifangyun_preview/v2/ext=" + fileType;
        fileModel.findById(fileid, function (err, fileEntity) {
            if (err)
                res.json(err)
            else if (fileEntity == null || fileEntity == '')
                res.json({error: "no such file"})
            else {
                var opts = {
                    notifyURL: domainConfig.domain + "/qiniu/persistent/file"
                }
                qiniu.fop.pfop(bucket, fileEntity.key, fops, opts, function (err, ret) {
                    console.log(ret)
                    if (err) {
                        res.json(err)
                    }
                    if (ret == null) {
                        res.json({error: "error"});
                    }
                    else res.end();
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

        switch (code) {
            // 成功
            case 0: {
                console.log("七牛code:" + code)
                fileModel.findOneAndUpdate(query, {$set: {code: code, pdfKey: pdfKey}}, function (err, fileEntity) {
                    if (err)
                        console.log(err)
                    redisConnection.redisClient.hset(fileEntity.userid.toString() + "qiniu", fileEntity._id.toString(), code)
                    console.log("转成pdf回调结果为" + fileEntity)
                    res.status(201);

                })
                break;
            }
            // 3处理失败 4回调失败
            case 3:
            case 4: {
                console.log("七牛code:" + code)
                fileModel.findOneAndRemove(query).exec(function (err, fileEntity) {
                    if (err)
                        console.log(err)
                    redisConnection.redisClient.hset(fileEntity.userid.toString() + "qiniu", fileEntity._id.toString(), code)
                    CommentModel.remove(fileEntity.comments);
                    console.log("删除的结果为" + fileEntity)
                    res.status(204);

                })
                break;
            }
            // 1等待处理 2正在处理
            default: {
                console.log("七牛code:" + code)
                fileModel.findOne(query).exec(function (err, fileEntity) {
                    if (err)
                        console.log(err)
                    redisConnection.redisClient.hset(fileEntity.userid.toString() + "qiniu", fileEntity._id.toString(), code)
                    res.status(200);
                })
                break;
            }

        }
    }
}

