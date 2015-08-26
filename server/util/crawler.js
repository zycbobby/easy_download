'use strict';

/**
 * The file will export a function to get things from a list of items
 * @type {string|string|string|*|exports}
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('../config/environment');
var Promise = require('bluebird');
var _ = require('lodash');
var logger = require('./logger');

function* getThings(items) {
  var things = yield Promise.settle(items.map(item => {
    return item.getOneThing();
  }));

  return things.filter(thing => {
    return thing.isFulfilled();
  }).map(thing => {
    return thing.value();
  })
}

function* getItems(sources) {
  var itemsBelongToSource = yield Promise.settle(sources.map(src => {
    return src.getItems();
  }));
  return _.flatten(itemsBelongToSource.filter(pi => {
    return pi.isFulfilled();
  }).map(items => {
    return items.value();
  }))
}

module.exports = {
  getItems: getItems,
  getThings: getThings
};
