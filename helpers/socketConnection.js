var socketio = {};
var io = {}
var socket_io = require('socket.io');
var initSocket = {};
var commentSocket = {};
var fileSocket = {}
var redisConnection = require('../helpers/redisConnection')
var mongoose = require('mongoose');
var commentModel = mongoose.model('Comment')
//获取io
socketio.getSocketio = function (server) {
    io = socket_io.listen(server);
    console.log('socket已经被获取')
    initSocket = io.sockets.on('connection', function (socket) {
        console.log('初始化命名空间连接成功');
        socket.on('userid', function (userid) {
            console.log("获取客户端userid成功")
            socketio.setCommentsEmit(userid)
            console.log('推送comment成功');
            socketio.setFileEmit(userid)
            console.log('推送file成功');
        })
        socket.on('unmark', function (commentid) {
            console.log("清除标记")
            socketio.unmarkEmit(commentid);
        })
    })
    commentSocket = io.of('/comment').on('connection', function () {
        console.log('comment命名空间连接成功');
    })
    fileSocket = io.of('/file').on('connection', function () {
        console.log('file命名空间连接成功');
    })
};

socketio.unmarkEmit = function (commentId) {
    commentModel.findById(commentId, function (err, CommentEntity) {
        if (err || CommentEntity == null)
            console.log({error: "找不到对应评论id"})
        var userid = CommentEntity.commentTo;
        redisConnection.redisClient.hdel(userid.toString() + 'comments', commentId.toString(), function (err, result) {
            if (err) {
                console.log(err)
            }
            socketio.setCommentsEmit(userid.toString());
            socketio.setFileEmit(userid.toString());
        })
    })
}

socketio.setCommentsEmit = function (userid) {
    redisConnection.redisClient.hlen(userid + 'comments', function (err, msg) {
        commentSocket.emit(userid, {commentCount: msg});
    })
    console.log("评论的事件服务端已经推送。")
}

socketio.setFileEmit = function (userid) {
    redisConnection.redisClient.hgetall(userid + 'comments', function (err, msg) {
        if (err) {
            console.log(err)
        }
        var filelist = [];
        for (var i in msg) {
            var valueInMsg = msg[i];
            var flag = true;
            for (var j in filelist) {
                if (valueInMsg == filelist[j]) {
                    flag = false;
                }
            }
            if (flag == true)
                filelist.push(valueInMsg);
        }
        fileSocket.emit(userid, filelist);
    })
    console.log("文件的事件服务端已经推送。")
}

module.exports = socketio