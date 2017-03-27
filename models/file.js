var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FileItem = new Schema({
    key: {type:String,unique:true},
    filename: String,
    filesize: Number,
    fileType: String,
    bucket: String,
    userid: {type: String, ref: 'User'},
    note: String,
    pdfKey: String,
    code: Number,
    create_at: {
        type: Date, default: function () {
            return +new Date() + 8 * 60 * 60 * 1000
        }
    },
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});


module.exports = mongoose.model('File',FileItem);