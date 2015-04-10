'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('mongoose-q')(require('mongoose'));
var config = require('./config/environment');
var CronJob = require('cron').CronJob;
var Thing =require('./api/thing/thing.model');
var ThingEs =require('./api/thing/thing.es');
var Q = require('q');
var _ = require('lodash');
var async = require('async');

var es = require('elasticsearch');
var esConfig = require('./config/environment').elasticSearch;

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var isEsSyncing = false;
//
var syncJob = new CronJob({
  cronTime: config.esCron,
  timeZone : config.timeZone,
  onTick: function() {
    var sessionId = new Date();
    if (!isEsSyncing) {
      isEsSyncing = true;
      Thing.findQ({ $or : [{indexed : false}, {indexed : null}]})
        .then(function(unIndexedThings) {

          console.log('find ' + unIndexedThings.length + ' unIndexedThings');

          var defer = Q.defer();

          var thingEs = new ThingEs(new es.Client({
            host : esConfig.host,
            log: esConfig.loglevel
          }));

          async.eachLimit(unIndexedThings, 10, function(thing, cb) {
            thingEs.indexThing(thing).then(function(res) {
              if (res.status === 'ok') {
                cb();
              } else {
                cb(res);
              }
            });
          }, function(err) {
            handleError(err);
            defer.resolve({});
          });
          return defer.promise;
        })
        .then(function(){
          console.log('going to finish sync');
          isEsSyncing = false;
        })
        .catch(function(err) {
          console.log(err);
          isEsSyncing = false;
          throw err;
        })
        .done();
    } else {
      console.log('[' + sessionId + ']es is now syncing, ignore this one : ' + new Date());
    }
  },
  onComplete : function(){
    console.log('essync job has completed');
  },
  start: false
});
//
syncJob.start();

console.log('Elastic Search synchronizor has been started, es cron:' + config.esCron);

function handleError(err) {
  if (err) {
    console.log(err);
    throw err;
  }
}

