/**
 * Created by congzihan on 17/3/28.
 */
var express = require('express');
var socketConnection = require('../helpers/socketConnection');
var redisConnection = require('../helpers/redisConnection')
module.exports = {
    emitUnviewedFiles: function (req, res, next) {
        var userid = req.params.id;
        redisConnection.redisClient.smembers(userid + 'files', function (err, msg) {
            if (err) {
                console.log(err)
            }
            socketConnection.setSocketEmit(userid, msg);
            console.log('推送的未读文件为' + msg);
        })
    },
    emitUnviewedCommentsNumber: function (req, res, next) {
        var userid = req.params.id;
        redisConnection.redisClient.scad(userid + 'comments', function (err, msg) {
            if (err) {
                console.log(err)
            }
            socketConnection.setSocketEmit(userid, msg);
            console.log('推送的评论数量' + msg);
        })
    }

}