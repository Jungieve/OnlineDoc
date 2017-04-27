/**
 * Created by congzihan on 17/3/28.
 */
var express = require('express');
var socketConnection = require('../helpers/socketConnection');
var redisConnection = require('../helpers/redisConnection')
module.exports = {
    emitUnviewedFiles: function (req, res, next) {
        var userid = req.params.id;
        redisConnection.redisClient.hgetall(userid + 'comments', function (err, msg) {
            if (err) {
                console.log(err)
            }
            var filelist = [];

            for (var key in msg) {
                var valueInMsg = msg[key];
                var flag = true;
                for (var valueInFileList in filelist) {
                    if (valueInMsg == valueInFileList) {
                        flag = false;
                    }
                }
                if (flag == true)
                    filelist.push(valueInMsg);
            }
            console.log(filelist)
            console.log('推送的未读文件为' + filelist);
            socketConnection.setSocketEmit(userid, filelist);

        })
        res.json({"code": 0})
    },
    emitUnviewedCommentsNumber: function (req, res, next) {
        var userid = req.params.id;
        redisConnection.redisClient.hlen(userid + 'comments', function (err, msg) {
            if (err) {
                console.log(err)
            }
            console.log('推送的评论数量' + msg);
            socketConnection.setSocketEmit(userid, msg);
        })
        res.json({"code": 0})
    },
    emitPersistentResult: function (req, res, next) {
        var userid = req.query.id;
        redisConnection.redisClient.hgetall(userid + "qiniu", function (err, body) {
            if (err) {
                console.log(err);
            }
            socketConnection.setSocketEmit(userid, body);
            res.json({code: 0});
        });

    }

}