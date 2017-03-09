var express = require('express');
var router = express.Router();
var oauthController = require('../controllers/qiniu');

/**
 * 七牛token获取
 */
router.get('/upload/token', oauthController.getToken);

/**
 * 七牛回调方法,成功上传后并从数据库中写入一个文件
 */
router.post('/upload/callback', oauthController.uploadCallback);


module.exports = router;
