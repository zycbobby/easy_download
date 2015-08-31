/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./environment');
var co = require('co');

require('./mongoConnection.js');

var Thing = require('../api/thing/thing.model');
var User = require('../api/user/user.model');
var Item = require('../api/item/item.model');
var Source = require('../api/source/source.model');

var sources = [{
  url : 'http://www.smzdm.com/p1'
}, {
  url : 'http://www.shihuo.cn'
}, {
  url : 'http://www.etao.com'
}];

co(function*(){
  yield Source.remove().exec();
  yield Source.create(sources);
  yield Item.remove().exec();
  process.exit(0);
}).catch(err => {
  console.log(err);
});

