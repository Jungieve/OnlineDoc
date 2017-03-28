var socketio = {};
var io = {}
var socket_io = require('socket.io');


//获取io
socketio.getSocketio = function (server) {

    io = socket_io.listen(server);
    /*
     io.sockets.on('connection', function (socket) {
     console.log('连接成功');
     socket.on('click1',function(){
     console.log('监听点击事件');
     var datas = [1,2,3,4,5];
     socket.emit('click2', {datas: datas});
     socket.broadcast.emit('click2',  {datas: datas});
     })
     })*/
};

socketio.setSocketEmit = function (id, data) {
    io.sockets.on('connection', function (socket) {
        console.log('监听点击事件');
        socket.emit(id, data);
    })
}

module.exports = socketio;