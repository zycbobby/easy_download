'use strict';

/***
 * This file will try to parse the items from the source
 * @type {exports}
 */

var util = require('util');
var commonCrawler = require('../../../parsers/common');
var Source = require('../source.model');
var Item = require('../../item/item.model');
var Q = require('q');
var url = require('url');

function shihuoCrawler(url) {
  commonCrawler.call(this, url);
}

util.inherits(shihuoCrawler, commonCrawler);

function getShihuoType(url){
  if (url.indexOf('haitao') > -1) {
    return  5;
  }

  if (url.indexOf('youhui') > -1) {
    return  1;
  }

  return 6;

}

shihuoCrawler.prototype.getItems = function() {
  var defer = Q.defer();
  var self = this;

  self.fetchWithRetry(5, function(res){

    if (res.error) {
      defer.reject({
        error : res.error
      });
      return;
    }

    var $ = res.jquery;
    var items = [];
    var articles = $('div.select-list > ul > li[class!=top]');
    for (var i = 0; i < articles.length; i++) {
      var item = new Item();
      var href = $(articles[i]).find('div.t2 > a')[0].attribs.href;
      var urlInfo = url.parse(href, true);
      item.url = href.replace(urlInfo.hash, '');
      item.thumbnail = $(articles[i]).find('div.t1 img')[0].attribs.src;
      item.type = getShihuoType(item.url);
      if (item.type === 1 || item.type === 5) {
        items.push(item);
      }
    }
    defer.resolve(items);
  });
  return defer.promise;
};

module.exports = shihuoCrawler;



