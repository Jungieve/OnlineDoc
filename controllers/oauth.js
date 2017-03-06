var express = require('express');
var OAuth = require('wechat-oauth');
var wechatParams = require('../wechat.json')
var client = new OAuth(wechatParams.AppId, wechatParams.AppSecret);
module.exports = {
    /**
     * 获取授权页面的URL地址
     * @param req
     * @param res
     * @param next
     */
    getAuthorizeURL: function (req, res, next) {
        var redirectUrl = encodeURI('http://jungieve.s1.natapp.cc/oauth/callback');
        var url = client.getAuthorizeURL(redirectUrl, '','snsapi_userinfo');
        console.log(url)
        res.redirect(url)
    },
    /**
     * 获取授权页面的URL地址(pc端)
     * @param req
     * @param res
     * @param next
     */
    getAuthorizeURLForWebsite: function (req, res, next) {
        var redirectUrl = encodeURI('http://jungieve.s1.natapp.cc/oauth/callback');
        var url = client.getAuthorizeURL(redirectUrl, '','snsapi_userinfo');
        res.redirect(url)
    },
    /**
     * 认证授权的回调函数
     * @param req
     * @param res
     * @param next
     */
    callback:function (req, res, next) {
        console.log('a')
        var code = req.query.code;
        client.getAccessToken(code, function (err, result) {
            var accessToken = result.data.access_token;
            var openid = result.data.openid;
            console.log('当前token=' + accessToken);
            console.log('当前openid=' + openid);
            client.getUser(openid, function (err, result) {
                console.log('use weixin api get user: ' + err);
                console.log(result);
            })
        })
    }

}