var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = mongoose.model('User');
var CommentItem = new Schema({
    post: {type: Schema.Types.ObjectId, ref: 'User'},
    comment: String,
    pageIndex: String,
    fileKey: String,
    create_at: {
        type: Date, default: function () {
            return +new Date() + 8 * 60 * 60 * 1000
        }
    },
    reply: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Comment', CommentItem);