var express = require('express');
var router = express.Router();
var indexController = require('../controllers/index');

router.get('/test', function (req, res, next) {
    res.render('index', {title: 'Express'});
});
router.get('/',indexController.checkSignature);
router.post('/', indexController.checkSignature);
module.exports = router;
