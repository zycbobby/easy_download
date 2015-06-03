'use strict';

/***
 * This file will try to parse the items from the source
 * @type {exports}
 */

var etao = require('./source.www.etao.com');

var crawler = new etao('http://www.etao.com');

crawler.getItems().then(function(items) {
  console.log(items);
  process.exit(0);
});



