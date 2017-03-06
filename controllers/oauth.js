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
        var redirectURL =  encodeUrl(req.params.URL);
        var url = client.getAuthorizeURL('http://' + redirectURL, '', 'snsapi_userinfo');
        res.redirect(url)
    },
    getAuthorizeURLForWebsite: function (req, res, next) {
        var redirectURL = encodeUrl(req.params.URL);
        var url = client.getAuthorizeURLForWebsite('http://' + redirectURL, '', 'snsapi_userinfo');
        res.redirect(url)
    },


}