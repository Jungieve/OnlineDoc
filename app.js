// connect mongodb using mongoose middleware

require('./helpers/mongoConnection');
var redisConnection = require('./helpers/redisConnection');


var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors')


var wechat = require('./routes/wechat')
var comment = require('./routes/comment')
var qiniu = require('./routes/qiniu')
var file = require('./routes/file')
var qrcode = require('./routes/qrcode')
var push = require('./routes/push')
var app = express();
var mongo_express = require('mongo-express/lib/middleware')
var mongo_express_config = require('./configs/mongo_express_config')


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors())
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/oauth', wechat);
app.use('/qiniu', qiniu);
app.use('/files', file);
app.use('/comments', comment);
app.use('/qrcodes', qrcode);
app.use('/pushs', push);
app.use('/mongo', mongo_express(mongo_express_config))


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
