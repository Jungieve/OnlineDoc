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
                var valueInMsg = obj[key];
                for (var valueInFileList in filelist) {
                    if (valueInMsg == valueInFileList) {
                       break;
                    }
                }
                filelist.push(valueInMsg);
            }
            socketConnection.setSocketEmit(userid, filelist);
            console.log('推送的未读文件为' + msg);
        })
        res.json({"code": 0})
    },
    emitUnviewedCommentsNumber: function (req, res, next) {
        var userid = req.params.id;
        redisConnection.redisClient.hlen(userid + 'comments', function (err, msg) {
            if (err) {
                console.log(err)
            }
            socketConnection.setSocketEmit(userid, msg);
            console.log('推送的评论数量' + msg);
        })
        res.json({"code": 0})
    }

}