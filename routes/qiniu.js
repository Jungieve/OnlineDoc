var express = require('express');
var router = express.Router();
var qiniuController = require('../controllers/qiniu');

/**
 * 七牛token获取
 */
router.get('/upload/token', qiniuController.getToken);

/**
 * 七牛回调方法,成功上传后并从数据库中写入一个文件
 */
router.post('/upload/callback', qiniuController.uploadCallback);

/**
 * 七牛回调方法,成功上传后并从数据库中写入一个文件
 */
router.get('/persistent/:key', qiniuController.persistentFile);

/**
 * 七牛回调方法,成功上传后并从数据库中写入一个文件
 */
router.post('/persistent/:key', qiniuController.persistentFileCallback);
module.exports = router;
