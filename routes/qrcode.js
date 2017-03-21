var express = require('express');
var router = express.Router();
var qrcodeController = require('../controllers/qrcode');

/**
 * 微信签名认证
 */
router.get('/:sceneId', qrcodeController.createLimitQRCode);
module.exports = router;
