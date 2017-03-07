var express = require('express');
var OAuth = require('wechat-oauth');
var mongoose = require('mongoose');
var userModel = mongoose.model('User');
var wechatConfig = require('../configs/wechat.json')
var domainConfig = require('../configs/domain.json')
var client = new OAuth(wechatConfig.AppId, wechatConfig.AppSecret);
module.exports = {
    /**
     * 获取授权页面并返回全部信息
     * @param req
     * @param res
     * @param next
     */
    getAuthorizedInfo: function (req, res, next) {
        var redirectUrl = encodeURI('http://'+domainConfig.domain+'/wechat/callback');
        var url = client.getAuthorizeURL(redirectUrl, 'userinfo', 'snsapi_userinfo');
        res.redirect(url)
    },
    /**
     * 查询用户信息,如果授权返回全部信息，否则返回openid
     * @param req
     * @param res
     * @param next
     */
    getUserInfo: function (req, res, next) {
        var redirectUrl = encodeURI('http://'+domainConfig.domain+'/wechat/callback');
        var url = client.getAuthorizeURL(redirectUrl, 'base', 'snsapi_base');
        res.redirect(url)
    },
    /**
     * 认证授权的回调函数
     * @param req
     * @param res
     * @param next
     */
    authorizeCallback: function (req, res, next) {
        var code = req.query.code;
        var state = req.query.state;
        client.getAccessToken(code, function (err, result) {
            var accessToken = result.data.access_token;
            var openid = result.data.openid;
            console.log('当前token=' + accessToken);
            console.log('当前openid=' + openid);
            var criteria = {openid: openid}; // 查询条件
            userModel.find(criteria, function (err, user) {
                if (err || user == null || user == '') {
                    console.log('根据openid查询，用户不存在')
                    // 如果未找到用户且未授权， 返回openid; 否则返回用户个人信息
                    if(state == 'base')
                        res.json(openid);
                    if(state == 'userinfo') {
                        client.getUser(openid, function (err, result) {
                            console.log('采用微信API获得user');
                            console.log('error: ' + err)
                            var oauth_user = result;
                            result = new userModel(oauth_user);
                            result.save(function (err, result) {
                                if (err) {
                                    console.log('User保存错误 ....');
                                    console.log('error: ' + err)
                                } else {
                                    console.log('User成功保存 ....');
                                    console.log("保存的用户结果为:" + result);
                                    res.json(result);
                                }
                            });
                        })
                    }
                }
                else {
                    console.log('根据openid查询，用户已经存在')
                    res.json(user);
                }
            });
        })
    }

}