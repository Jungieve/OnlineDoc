var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserItem = new Schema({
    openid: String,
    nickname: String,
    headimgurl: String
});

module.exports = mongoose.model('User',UserItem);