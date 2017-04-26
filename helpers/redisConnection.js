/**
 * Created by congzihan on 16/12/3.
 */
var redis = require('redis');
var redisClient = redis.createClient();

redisClient.on('connect', function () {
    console.log('Redis connected ');
});

redisClient.on('error', function (err) {
    console.log('Redis error '+err);
});

redisClient.on('end', function () {
    console.log('Redis end ');
});

exports.redisClient = redisClient;