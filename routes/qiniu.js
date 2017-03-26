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
 * 七牛持久化方法，能够对指定id的文件进行持久化操作（转为pdf)
 */
router.put('/persistent/file', qiniuController.persistentFile);

/**
 * 七牛回调方法,成功上传后并从数据库中写入一个文件
 */
router.post('/persistent/file', qiniuController.persistentFileCallback);

/**
 * 七牛回调方法给客户端轮询
 */
router.get('/persistent/file', qiniuController.checkPersistentResult);
module.exports = router;
