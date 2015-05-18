'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('mongoose');
var config = require('./config/environment');
var CronJob = require('cron').CronJob;
var Thing = require('./api/thing/thing.model');
var ThingCtrl = require('./api/thing/thing.controller');
var ThingEs = require('./api/thing/thing.es');
var Q = require('q');
var _ = require('lodash');
var async = require('async');

var es = require('elasticsearch');
var esConfig = require('./config/environment').elasticSearch;

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var isEsSyncing = false;
var limit = esConfig.scanLimit;
var lastScanId = mongoose.Types.ObjectId(0);

/**
 * Index the item that it not indexed from mongodb to elastic search
 * @param unIndexedThings
 * @returns {*}
 */
function indexUnIndexedThings(unIndexedThings) {
  console.log('find ' + unIndexedThings.length + ' unIndexedThings');
  var defer = Q.defer();

  var thingEs = new ThingEs(new es.Client({
    host: esConfig.host,
    log: esConfig.loglevel
  }));

  async.eachLimit(unIndexedThings, 10, function (thing, cb) {
    thingEs.indexThing(thing).then(function (res) {
      if (res.status === 'ok') {
        cb();
      } else {
        cb(res);
      }
    });
  }, function (err) {
    handleError(err);
    defer.resolve({});
  });
  return defer.promise;
}

/**
 * set indexed = false for unindexed things
 * @param things
 * @returns {*}
 */
function updateUnIndexedThings(things) {
  var defer = Q.defer();
  var esRemovedThings = 0;
  var thingEs = new ThingEs(new es.Client({
    host: esConfig.host,
    log: esConfig.loglevel
  }));
  async.eachLimit(things, 10, function (thing, cb) {
    thingEs.exists(thing._id).then(function (res) {
      if (!res.exists) {
        // update to be {indexed : false}
        esRemovedThings++;
        Thing.update({_id: thing._id}, { $set: {indexed: false} }, function (err) {
          handleError(err);
          cb();
        });
      } else {
        cb();
      }
    })
  }, function (err) {
    handleError(err);
    console.log('There are ' + esRemovedThings + ' indexed thing were deleted from Elastic Search, and add to reIndexed list');
    Thing.findOne().sort('-_id').limit(1).exec(function(err, newestThing) {
      handleError(err);
      if (''+newestThing._id === ''+lastScanId) {
        lastScanId =  mongoose.Types.ObjectId(0);
      } else {
        lastScanId = things.length > 0 ?things[things.length - 1]._id : lastScanId;
      }
      console.log('set lastScanId to be' + lastScanId);
      defer.resolve();
    });
  });

  return defer.promise;
}


var syncJob = new CronJob({
  cronTime: config.esCron,
  timeZone: config.timeZone,
  onTick: function () {
    var sessionId = new Date();
    if (!isEsSyncing) {
      isEsSyncing = true;
      Thing.find({$or: [{indexed: false}, {indexed: null}]})
        .limit(limit)
        .then(indexUnIndexedThings)
        .then(ThingCtrl.findIndexedThings.bind(null, lastScanId, limit))
        .then(updateUnIndexedThings)
        .then(function () {
          console.log('going to finish sync');
          isEsSyncing = false;
        })
        .catch(function (err) {
          console.log(err);
          isEsSyncing = false;
          throw err;
        })
        .done();
    } else {
      console.log('[' + sessionId + '] es is now syncing, ignore this one : ' + new Date());
    }
  },
  onComplete: function () {
    console.log('essync job has completed');
  },
  start: false
});
//
syncJob.start();

console.log('Elastic Search synchronizer has been started, es cron:' + config.esCron + ' environment : ' + process.env.NODE_ENV);

function handleError(err) {
  if (err) {
    console.log(err);
    throw err;
  }
}

