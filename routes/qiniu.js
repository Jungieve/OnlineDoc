var express = require('express');
var router = express.Router();
var oauthController = require('../controllers/qiniu');

router.get('/token', oauthController.getToken);
router.post('/uploadCallback', oauthController.uploadCallback);

module.exports = router;
