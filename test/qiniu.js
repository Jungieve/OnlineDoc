const request = require('supertest');
const express = require('express');
var assert = require('assert')
var app = require('../app');

//测试七牛token并进行回调
request(app)
    .get('/qiniu/upload/token')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function (res) {
        if (!('token' in res.body)) throw new Error("missing token key");
    })
    .end(function (err, res) {
        if (err)
            throw (err);
        console.log("/qiniu/upload/token的测试结果为");
        console.log(res.body)
    });




