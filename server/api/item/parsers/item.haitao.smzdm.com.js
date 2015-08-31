'use strict';

/***
 * This file will try to parse the items from the source
 * @type {exports}
 */

var util = require('util');
var smzdmCrawler = require('./item.www.smzdm.com.js');

function haitaoCrawler(item) {
  smzdmCrawler.call(this, item.url);
  this.item = item;
}

util.inherits(haitaoCrawler, smzdmCrawler);

module.exports = haitaoCrawler;



