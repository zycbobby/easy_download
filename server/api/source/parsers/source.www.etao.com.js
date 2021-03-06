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

function etaoCrawler(url) {
  commonCrawler.call(this, url);
}

util.inherits(etaoCrawler, commonCrawler);

function getEtaoType(url){
  if (url.indexOf('wanke.etao.com') > -1) {
    return  1;
  }
  return 6;
}

etaoCrawler.prototype.getItems = function() {
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
    var articles = $('#J_FeedList').find('div.feed[data-wankeid]');
    for (var i = 0; i < articles.length; i++) {
      var item = new Item();
      var article = $(articles[i]).find('h3 a')[0];
      var href = article.attribs.href;
      var urlInfo = url.parse(href, true);
      item.url = href.replace(urlInfo.hash, '');
      item.type = getEtaoType(item.url);
      item.thumbnail = $(articles[i]).find('img')[0].attribs.src;
      if (item.type === 1) {
        items.push(item);
      }
    }
    defer.resolve(items);
  });
  return defer.promise;
};

module.exports = etaoCrawler;



