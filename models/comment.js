var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CommentItem = new Schema({
    post: {type: Schema.Types.ObjectId, ref: 'User'},
    comment: String,
    index: String,
    fileid: String,
    create_at: {
        type: Date, default: function () {
            return +new Date() + 8 * 60 * 60 * 1000
        }
    },
    reply: {type: Schema.Types.ObjectId, ref: 'User'},
    viewed: {type: Boolean, default: false}
});

module.exports = mongoose.model('Comment', CommentItem);