var express = require('express');
var router = express.Router();
var oauthController = require('../controllers/wechat');

router.get('/authorize/info', oauthController.getAuthorizedInfo);
router.get('/info', oauthController.getUserInfo);
router.get('/callback', oauthController.authorizeCallback);

module.exports = router;
