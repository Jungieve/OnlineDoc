const request = require('supertest');
const express = require('express');

var app = require('../app');

//测试七牛token
request(app)
    .get('/qiniu/token')
    .expect('Content-Type', /json/)
    .expect(function (res) {
        if (!('token' in res.body)) throw new Error("missing token key");
    })
    .expect(200)
    .end(function (err, res) {
        if (err)
            throw (err);
    });