var express = require('express');
var router = express.Router();
var userController = require('../controllers/user');

/**
 * 分页获取用户的文件列表
 */
router.get('/:id/list', userController.getUserFileListByPage);

/**
 * 从七牛与数据库中删除一个文件
 */
router.delete('/:id', userController.deleteFile);

/**
 * 从数据库中获取一个文件
 */
router.get('/:id', userController.getFile);
module.exports = router;
