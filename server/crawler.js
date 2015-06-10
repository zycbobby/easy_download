/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('mongoose');
var config = require('./config/environment');
var CronJob = require('cron').CronJob;
var Source = require('./api/source/source.model');
var Item = require('./api/item/item.model');
var Thing = require('./api/thing/thing.model');
var Q = require('q');
var _ = require('lodash');
var async = require('async');

var log4js = require('log4js');
log4js.configure(config.log4js);

var logger = log4js.getLogger('normal');
logger.setLevel('INFO');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

var isItemGetting = false;

//
var getItemJob = new CronJob({
  cronTime: config.itemCron,
  timeZone: config.timeZone,
  onTick: function () {
    var sessionId = new Date();
    if (!isItemGetting) {
      isItemGetting = true;
      Q().then(function(){
        var defer = Q.defer();
        var results = [];
        Source.find({active: true}).exec(function (err, sources) {
          logger.info('get ' + sources.length + ' sources');
          async.each(sources, function(source, cb) {
            source.getItems().then(function(items){
              results.push(items);
              cb(null);
            }, function(err) {
              cb(null);
            });
          }, function(err) {
            if (err) throw err;
            defer.resolve(results);
          })
        });
        return defer.promise;
      }).then(function (itemsArray) {
          var flatten = _.flatten(itemsArray);
          logger.info('[' + sessionId + '] get ' + flatten.length + ' items');

          var defer = Q.defer();
          async.map(flatten, function(item, cb) {
            Item.findOne({ url : item.url }).exec(function(err, doc) {
              if (err) throw err;
              if (!doc) {
                Item.create(item, cb);
              } else {
                cb();
              }
            });
          }, function(err, results) {
            if (err) throw err;
            logger.info('[' + sessionId + '] insert ' + results.filter(function(r) { return !!r }).length + ' items');
            isItemGetting = false;
            defer.resolve(); // how to resolve results
          });
          return defer.promise;
        }).catch(function (err) {
          logger.error(err);
          isItemGetting = false;
        }).done();
    } else {
      logger.info('[' + sessionId + ']item is now getting, ignore this one : ' + new Date());
    }

  },
  onComplete: function () {
    logger.info('item job has completed');
  },
  start: false
});

getItemJob.start();

var isThingGetting = false;
//
var getThingJob = new CronJob({
  cronTime: config.thingCron,
  timeZone: config.timeZone,
  onTick: function () {
    var sessionId = new Date();
    if (!isThingGetting) {
      isThingGetting = true;
      Q().then(function(){
        var defer = Q.defer();
        var results = [];
        Item.find({crawled: false}).exec(function (err, items) {
          if (err) throw err;
          logger.info('[' + sessionId + '] begin crawl ' + items.length + ' items');
          async.eachLimit(items, 5, function (item, cb) {
            item.getOneThing().then(function (thing) {
              results.push(thing);
              cb(null);
            }, function () {
              logger.info('[' + sessionId + '] omit: ' + item.url);
              cb(null);
            });
          }, function (err) {
            if (err) {
              logger.error(err);
              throw err;
            } else {
              defer.resolve(results);
            }
          });
        });
        return defer.promise;
      }).then(function (things) {

        logger.info('[' + sessionId + '] parse ' + things.length + ' things');

        var defer = Q.defer();
        async.map(things, function(thing, cb) {
          Thing.findOne({ url : thing.source }).exec(function(err, doc) {
            if (err) throw err;
            if (!doc) {
              Thing.create(thing, cb);
            } else {
              cb();
            }
          });
        }, function(err, results) {
          if (err) throw err;
          logger.info('[' + sessionId + '] insert ' + results.filter(function(r) { return !!r }).length + ' things');
          isThingGetting = false;
          defer.resolve(); // how to resolve results
        });
        return defer.promise;
      }).catch(function (err) {
          logger.error(err.stack);
          isThingGetting = false;
        }).done();
    } else {
      logger.info('[' + sessionId + '] thing is now getting, ignore this one : ' + new Date());
    }
  },
  onComplete: function () {
    logger.info('thing job has completed');
  },
  start: false
});
//
getThingJob.start();

logger.info('Crawler has been started, thing cron:' + config.thingCron + ' item cron : ' + config.itemCron);


