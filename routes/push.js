var express = require('express');
var router = express.Router();
var pushController = require('../controllers/push');

//推送所有新评论文件
router.get('/subscriber/:id/unviewed/files', pushController.emitUnviewedFiles);


//推送所有新评论数量
router.get('/subscriber/:id/comments/count', pushController.emitUnviewedCommentsNumber);

//推送所有新的持久化
router.get('/subscriber/:id/persistent/files', pushController.emitPersistentResult);
module.exports = router;