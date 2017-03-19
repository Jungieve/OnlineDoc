var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserItem = new Schema({
    openid: {type:String,unique:true},
    nickname: String,
    headimgurl: String,
    files: [{type: Schema.Types.ObjectId, ref: 'File'}],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});

module.exports = mongoose.model('User',UserItem);