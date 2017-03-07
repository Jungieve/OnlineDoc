var express = require('express');
var router = express.Router();
var oauthController = require('../controllers/qiniu');

/**
 * 七牛token获取
 */
router.get('/token', oauthController.getToken);
/**
 * 七牛回调方法
 */
router.post('/callback', oauthController.uploadCallback);

module.exports = router;
