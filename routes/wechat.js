var express = require('express');
var router = express.Router();
var oauthController = require('../controllers/wechat');

router.get('/authorized/info', oauthController.getAuthorizedInfo);
router.get('/info', oauthController.getUserInfo);
router.get('/authorizeCallback', oauthController.authorizeCallback);

module.exports = router;
