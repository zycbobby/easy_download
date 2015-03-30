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
        error : error
      });
      return;
    }

    var $ = res.jquery;
    var items = [];

    var articles =  $('div[articleid] h4.itemName > a');
    for (var i = 0; i < articles.length; i++) {
      var item = new Item();
      item.url = articles[i].attribs.href;
      items.push(item);
    }
    defer.resolve(items);
  });
  return defer.promise;
};

module.exports = smzdmCrawler;



