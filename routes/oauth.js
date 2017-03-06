var express = require('express');
var router = express.Router();
var oauthController = require('../controllers/oauth');

router.get('/:URL', oauthController.getAuthorizeURL);
router.get('/:URLForWebsite', oauthController.getAuthorizeURLForWebsite);

module.exports = router;
