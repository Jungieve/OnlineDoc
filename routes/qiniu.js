var express = require('express');
var router = express.Router();
var oauthController = require('../controllers/qiniu');

router.get('/token', oauthController.getToken);
router.post('/callback', oauthController.uploadCallback);

module.exports = router;
