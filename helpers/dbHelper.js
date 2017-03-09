var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');

/**
 *
 * @param page 当前第几页（从1 开始算）
 * @param pageSize 查询尺寸
 * @param Model
 * @param populate
 * @param queryParams
 * @param sortParams
 * @param callback
 * 返回格式如下
 *  {
        records: $page.results,当前页的记录
        pageCount: $page.pageCount,共多少页
    }
 */
var pageQuery = function (page, pageSize, Model, populate, queryParams, sortParams, callback) {
    var start = (page - 1) * pageSize;
    var $page = {
        pageNumber: page
    };
    console.log(pageSize)
    async.parallel({
        count: function (done) {  // 查询数量
            Model.count(queryParams).exec(function (err, count) {
                done(err, count);
            });
        },
        records: function (done) {   // 查询一页的记录
            Model.find(queryParams).skip(start).limit(pageSize).populate(populate).sort(sortParams).exec(function (err, doc) {
                done(err, doc);
            });
        }
    }, function (err, results) {
        console.log(err)
        var count = results.count;
        $page.pageCount = (count - 1) / pageSize + 1;
        $page.results = results.records;
        callback(err, $page);
    });
};

module.exports = {
    pageQuery: pageQuery
};