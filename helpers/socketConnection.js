var socketio = {};
var io = {}
var socket_io = require('socket.io');


//获取io
socketio.getSocketio = function (server) {

    io = socket_io.listen(server);

};

socketio.setSocketEmit = function (id, data) {
    io.sockets.on('connection', function (socket) {
        console.log('监听点击事件');
        socket.emit(id, data);
    })
}

module.exports = socketio;