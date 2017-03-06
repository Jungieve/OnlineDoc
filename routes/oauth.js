var express = require('express');
var router = express.Router();
var oauthController = require('../controllers/oauth');

router.get('/mobile', oauthController.getAuthorizeURL);
router.get('/pc', oauthController.getAuthorizeURLForWebsite);
router.get('/callback', oauthController.callback);

module.exports = router;
