var express = require('express');
var router = express.Router();
var oauthController = require('../controllers/wechat');

/**
 * 微信授权并获取用户信息
 */
router.get('/authorized/userinfo', oauthController.getAuthorizedUserInfo);
/**
 * 静默授权并获取用户信息（可能部分）
 */
router.get('/authorized/base', oauthController.getAuthorizedBase);
/**
 * 微信回调方法
 */
router.get('/callback', oauthController.authorizeCallback);

module.exports = router;
