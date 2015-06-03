'use strict';

/***
 * This file will try to parse the items from the source
 * @type {exports}
 */

var util = require('util');
var wankeCrawler = require('./item.wanke.etao.com.js');

function etaoCrawler(url) {
  wankeCrawler.call(this, url);
}

util.inherits(etaoCrawler, wankeCrawler);

module.exports = etaoCrawler;



