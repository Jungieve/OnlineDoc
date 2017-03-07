var express = require('express');
var router = express.Router();
var indexController = require('../controllers/index');

/**
 * 微信签名认证
 */
router.get('/',indexController.checkSignature);
module.exports = router;
