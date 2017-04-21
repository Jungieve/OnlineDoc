var express = require('express');
var router = express.Router();
var oauthController = require('../controllers/wechat');
/**
 * 微信查询签名
 */
router.get('/checkSignature', oauthController.checkSignature);
/**
 * 微信授权并获取用户信息
 */
router.get('/wechat/userinfo', oauthController.getAuthorizedUserInfo);

/**
 * 静默授权并获取用户信息（可能部分）
 */
router.get('/web/userinfo', oauthController.getAuthorizedForWebsite);

/**
 * 静默授权并获取用户信息（可能部分）
 */
router.get('/wechat/base', oauthController.getAuthorizedBase);
/**
 * 微信回调方法
 */
router.get('/wechat/callback', oauthController.authorizeCallback);

/**
 * 微信网页回调方法
 */
router.get('/web/callback', oauthController.authorizeCallbackForWebsite);

module.exports = router;
