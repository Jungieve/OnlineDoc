var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserItem = new Schema({
    openid: {type:String,unique:true},
    nickname: String,
    headimgurl: String
});

module.exports = mongoose.model('User',UserItem);