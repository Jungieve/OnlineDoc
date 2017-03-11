var express = require('express');
var crypto = require('crypto');
var wechat = require('wechat')
var wechatParams = require('../configs/wechat.json')
var token = {
    token: wechatParams.token,
    appid: wechatParams.AppId,
};
module.exports = {
    checkSignature: wechat(token)
        .event(function (message, req, res, next) {
            console.log(message)
            res.reply("你的微信id为" + message.FromUserName + "进行授权登录");
            // TODO
        }).location(function (message, req, res, next) {
            // TODO
        }).middlewarify()

}