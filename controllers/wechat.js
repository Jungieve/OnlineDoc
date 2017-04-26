var express = require('express');
var OAuth = require('wechat-oauth');
var mongoose = require('mongoose');
var wechat = require('wechat');
var WechatAPI = require('wechat-api');
var userModel = mongoose.model('User');
var wechatConfig = require('../configs/wechat.json')
var webConfig = require('../configs/website.json')
var domainConfig = require('../configs/domain.json')
var client = new OAuth(wechatConfig.AppId, wechatConfig.AppSecret);
var clientForWeb = new OAuth(webConfig.AppId, webConfig.AppSecret);
var api = new WechatAPI(webConfig.AppId, webConfig.AppSecret);
var redisConnection = require('../helpers/redisConnection')
module.exports = {
    /**
     * 检查微信签名
     */
    checkSignature: wechat({
        token: wechatConfig.token,
        appid: wechatConfig.AppId,
    }).event(function (message, req, res, next) {
        console.log(message)
        // TODO
    }).middlewarify(),

    /**
     * 获取JS-SDK签名
     * @param req
     * @param res
     * @param next
     */
    getTicket: function(req,res,next){
        redisConnection.redisClient.get('ticket',function(err, reply) {
            if(reply == null || reply == ''){
                api.getTicket(function(err,result) {
                    if(err)
                        res.json({error: "获取ticket错误"})
                    redisConnection.redisClient.set('ticket',result.ticket,  'EX',7200)
                    res.json(result)
                })
            }
            else res.json({ticket: reply})
        })

    },
    /**
     * 获取授权页面并返回全部信息
     * @param req
     * @param res
     * @param next
     */
    getAuthorizedForWechat: function (req, res, next) {
        var fileId = req.query.fileId || '';
        var page = req.query.page || '';
        var domain = req.query.domain || '';
        var url = req.query.url || '';
        console.log(url)
        var state;
        if(domain == 'readPdf')
            state = (domain+'?pdfUrl='+url+'&page='+page+'&fileId='+fileId)
        else if(domain == 'readImg')
            state = (domain+'?imgUrl='+url+'&page='+page+'&fileId='+fileId)
        else
            state = '?fileId='+fileId;
        console.log("跳转之前的state:"+state)
        var redirectUrl = encodeURI('http://' + domainConfig.domain + '/oauth/wechat/callback');
        var url = client.getAuthorizeURL(redirectUrl,state, 'snsapi_userinfo');
        res.redirect(url)
    },

    /**
     * 查询用户信息,如果授权返回全部信息，否则返回openid
     * @param req
     * @param res
     * @param next
     */
    getAuthorizedForWebsite: function (req, res, next) {
        var fileId = req.query.fileId || '';
        var page = req.query.page || '';
        var domain = req.query.domain || '';
        var url = req.query.url || '';
        var state = null;
        if(domain == 'readPdf')
            state = (domain+'?pdfUrl='+url+'&page='+page+'&fileId='+fileId)
        else if(domain == 'readImg')
            state = (domain+'?imgUrl='+url+'&page='+page+'&fileId='+fileId)
        else
            state = '?fileId='+fileId;
        console.log("跳转之前的state:"+state)
        var redirectUrl = encodeURI('http://' + domainConfig.domain + '/oauth/web/callback');
        var url = clientForWeb.getAuthorizeURLForWebsite(redirectUrl, encodeURI(state), 'snsapi_login');
        res.redirect(url)
    },

    /**
     * 根据id查询用户信息
     * @param req
     * @param res
     * @param next
     */
    getUserInfoById: function (req, res, next) {
        var userid = req.params.id;
        userModel.findById(userid, function (err, userEntity) {
            if (err)
                res.json({error: "no such user"})
            else
                res.json(userEntity);
        })

    },


    /**
     * 认证授权的回调函数
     * @param req
     * @param res
     * @param next
     */
    authorizeCallback: function (req, res, next) {
        var state = req.query.state;
        var code = req.query.code;

        client.getAccessToken(code, function (err, result) {
            if(err) {
                console.log("授权错误code"+code)
                throw err;
            }
            var unionid = result.data.unionid;
            var openid = result.data.openid;
            client.getUser({openid:openid}, function (err, result) {
                if(err)
                    throw err;
                userModel.find({unionid: unionid}, function (err, user) {
                    if (err || user == null || user == '') {
                        console.log('用户不存在')
                        var oauth_user = new userModel(result);
                        oauth_user.save(function (err, result) {
                            if (err) {
                                console.log('User保存错误: ' + err)
                            } else {
                                console.log("User成功保存:" + result);
                                res.redirect( '/#/'+state+'&id=' + result._id);
                            }
                        });
                    }
                    else {

                        res.redirect( '/#/'+state+'&id=' + user[0]._id);
                    }
                });
            });
        });
    }, /**
     * 认证授权的回调函数
     * @param req
     * @param res
     * @param next
     */
    authorizeCallbackForWebsite: function (req, res, next) {
        var state = req.query.state;
        var code = req.query.code ;

        clientForWeb.getAccessToken(code, function (err, result) {
            if(err) {
                console.log("授权错误code"+code)
                throw err;
            }
            var unionid = result.data.unionid;
            var openid = result.data.openid;
            clientForWeb.getUser({openid:openid}, function (err, result) {
                if(err)
                    throw err;
                userModel.find({unionid: unionid}, function (err, user) {
                    if (err || user == null || user == '') {
                        console.log('用户不存在')
                        var oauth_user = new userModel(result);
                        oauth_user.save(function (err, result) {
                            if (err) {
                                console.log('User保存错误: ' + err)
                            } else {
                                console.log("User成功保存:" + result);
                                res.redirect( '/#/'+state+'&id=' + result._id);
                            }
                        });
                    }
                    else {
                        res.redirect( '/#/'+state+'&id=' + user[0]._id);
                    }
                });
            });
        })
    }

}