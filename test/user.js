const request = require('supertest');
const express = require('express');
var assert = require('assert')
var app = require('../app');

//
//测试获取文件
request(app)
    .get('/users/oJJNnwRciaFfXY_C06NlrwWnjSYM/files/FqOQ8OYKilxlIkKlaci5V3z2u_VS')
    .expect('Content-Type', /json/)
    .expect(200)
    .expect(function (res) {
        if (!('key' in res.body)) throw new Error("missing key key");
    })
    .end(function (err, res) {
        if (err && res.status !== 404)
            throw err;
        if (res.status === 404)
            assert.deepEqual({}, res.body);
        console.log('测试结果为:');
        console.log(res.body);
    });

//测试删除文件
request(app)
    .delete('/users/oJJNnwRciaFfXY_C06NlrwWnjSYM/files/FqOQ8OYKilxlIkKlaci5V3z2u_VS')
    .expect(204)
    .expect(function (res) {
        if (!('key' in res.body)) throw new Error("missing key key");
    })
    .end(function (err, res) {
        if (err)
            throw err;
        console.log('测试结果为:');
        console.log(res.body);
    });

request(app)
    .delete('/users/oJJNnwRciaFfXY_C06NlrwWnjSYM/files/FqOQ8OYKilxlIkKlaci5V3z2u_VS')
    .expect(404)
    .expect(function (res) {
        assert.deepEqual({code: 612, error: 'no such qiniu or directory'}, res.body)
    })
    .end(function (err, res) {
        if (err)
            throw err;
    });