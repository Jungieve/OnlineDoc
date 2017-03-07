var qiniu = require("qiniu");
var qiniuConfig = require('../configs/qiniu.json')
var domainConfig = require('../configs/domain.json')
//需要填写你的 Access Key 和 Secret Key
qiniu.conf.ACCESS_KEY = qiniuConfig.accessKey;
qiniu.conf.SECRET_KEY = qiniuConfig.secretKey;

//要上传的空间
bucket = qiniuConfig.bucket;


module.exports = {
    /**
     * 获取七牛token
     * @param req
     * @param res
     * @param next
     */
    getToken: function (req, res, next) {
        var putPolicy = new qiniu.rs.PutPolicy(bucket);
        putPolicy.callbackUrl = 'http://'+domainConfig.domain+'/qiniu/uploadCallback';
        putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)&fileType=$(mimeType)' +
            '&bucket=$(bucket)&key=$(key)' +
            '&user=$(x:user)';
        res.json(putPolicy.token());
    },
    uploadCallback: function (req, res, next) {
        console.log("文件上传成功"+req.body);
        res.json(req.body);
    }
}

