var WechatAPI = require('wechat-api');
var wechatConfig = require('../configs/wechat.json')
var api = new WechatAPI(wechatConfig.AppId, wechatConfig.AppSecret);
module.exports = {
    /**
     * 分页获得用户文件列表
     * @param req
     * @param res
     * @param next
     */
    createLimitQRCode: function (req, res, next) {
        var index = req.params.sceneId;
        api.createLimitQRCode(index, function (err, result) {
            if (err)
                throw err;
            else
                res.json(api.showQRCodeURL(result.ticket));
        });
    },
}
