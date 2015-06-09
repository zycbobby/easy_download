/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('mongoose-q')(require('mongoose'));
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
      Source.findQ({active: true}).then(function (sources) {
        var results = [];
        logger.info('get ' + sources.length + ' sources');
        sources.forEach(function (source) {
          results.push(source.getItems());
        });
        return results;
      }).then(Q.all)
        .then(function (itemsArray) {
          var results = [];
          var flatten = _.flatten(itemsArray);
          logger.info('[' + sessionId + '] get ' + flatten.length + ' items');
          flatten.forEach(function (item) {
            results.push(Item.createQ(item));
          });
          return results;
        }).then(Q.allSettled)
        .then(function (results) {
          var count = _.filter(results, function (r) {
            return r.state !== 'rejected'
          }).length;
          logger.info('[' + sessionId + '] insert ' + count + ' items');
          isItemGetting = false;
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
      Item.findQ({crawled: false}).then(function (items) {

        var defer = Q.defer();
        var things = [];
        logger.info('[' + sessionId + '] begin crawl ' + items.length + ' items');
        async.eachSeries(items, function (item, cb) {
          item.getOneThing().then(function (thing) {
            things.push(thing);
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
            defer.resolve(things);
          }
        });
        return defer.promise;
      }).then(function (things) {
        var results = [];
        logger.info('[' + sessionId + '] parse ' + things.length + ' things');
        things.forEach(function (thing) {
          results.push(Thing.createQ(thing));
        });
        return results;
      }).then(Q.allSettled)
        .then(function (results) {
          var count = _.filter(results, function (r) {
            return r.state != 'rejected'
          }).length;
          logger.info('[' + sessionId + '] finish inserting ' + count + ' things');
          isThingGetting = false;
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


