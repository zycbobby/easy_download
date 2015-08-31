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

function smzdmCrawler(url) {
  commonCrawler.call(this, url);
}

util.inherits(smzdmCrawler, commonCrawler);

smzdmCrawler.prototype.getItems = function() {
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
    var articleDivs = $('div[articleid]');
    for (var i = 0; i < articleDivs.length; i++) {
      var item = new Item();
      item.url = $(articleDivs[i]).find('h4.itemName > a')[0].attribs.href;
      item.thumbnail = $(articleDivs[i]).find('a > img')[0].attribs.src;
      item.type = Number(articleDivs[i].attribs.articleid.split('_')[0]);
      if (item.type === 1 || item.type === 5) {
        items.push(item);
      }
    }
    defer.resolve(items);
  });
  return defer.promise;
};

module.exports = smzdmCrawler;



