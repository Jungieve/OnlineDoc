var express = require('express');
var OAuth = require('wechat-oauth');
var mongoose = require('mongoose');
var wechat = require('wechat');
var userModel = mongoose.model('User');
var wechatConfig = require('../configs/wechat.json')
var webConfig = require('../configs/website.json')
var domainConfig = require('../configs/domain.json')
var client = new OAuth(wechatConfig.AppId, wechatConfig.AppSecret);
var clientForWeb = new OAuth(webConfig.AppId, webConfig.AppSecret);
module.exports = {
    checkSignature: wechat({
        token: wechatConfig.token,
        appid: wechatConfig.AppId,
    }).event(function (message, req, res, next) {
        console.log(message)
        // TODO
    }).middlewarify(),
    /**
     * 获取授权页面并返回全部信息
     * @param req
     * @param res
     * @param next
     */
    getAuthorizedForWechat: function (req, res, next) {
        var redirectUrl = encodeURI('http://' + domainConfig.domain + '/oauth/wechat/callback');
        var url = client.getAuthorizeURL(redirectUrl, 'userinfo', 'snsapi_userinfo');
        res.redirect(url)
    },

    /**
     * 查询用户信息,如果授权返回全部信息，否则返回openid
     * @param req
     * @param res
     * @param next
     */
    getAuthorizedForWebsite: function (req, res, next) {
        var redirectUrl = encodeURI('http://' + domainConfig.domain + '/oauth/web/callback');
        var url = clientForWeb.getAuthorizeURLForWebsite(redirectUrl, 'web', 'snsapi_login');
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
        client.getAccessToken(code, function (err, result) {
            console.log('当前微信授权数据' + result)
            var openid = result.data.openid;
            var unionid = result.data.unionid;
            var criteria = {unionid: unionid}; // 查询条件
            userModel.find(criteria, function (err, user) {
                if (err || user == null || user == '') {
                    console.log('根据openid查询，用户不存在')
                    client.getUser(openid, function (err, result) {
                        if (err)
                            console.log(err)
                        var oauth_user = new userModel(result);
                        oauth_user.save(function (err, result) {
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
                else {
                    console.log('根据unionid查询，用户已经存在')
                    res.json(user);
                }
            });
        })
    }, /**
     * 认证授权的回调函数
     * @param req
     * @param res
     * @param next
     */
    authorizeCallbackForWebsite: function (req, res, next) {
        var code = req.query.code;
        clientForWeb.getAccessToken(code, function (err, result) {
            console.log("当前扫码登录数据" + result)
            var unionid = result.data.unionid;
            var openid = result.data.openid;
            userModel.find({unionid: unionid}, function (err, user) {
                if (err || user == null || user == '') {
                    console.log('根据openid查询，用户不存在')
                    clientForWeb.getUser(openid, function (err, result) {
                        if (err)
                            console.log(err)
                        var userEntity = new userModel(result);
                        userEntity.save(function (err, result) {
                            if (err) {
                                console.log('User保存错误 ....');
                                console.log('error: ' + err)
                            } else {
                                console.log('User成功保存 ....');
                                console.log("保存的用户结果为:" + result);
                                res.redirect('/')
                                // res.json(result);
                            }
                        });
                    })
                }
                else {
                    console.log('根据unionid查询，用户已经存在')
                    res.redirect('/')
                    // res.json(user);
                }
            });

        })
    }

}