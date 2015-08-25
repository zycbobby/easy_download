// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./config/environment');
var esConfig = config.elasticSearch;
var CronJob = require('cron').CronJob;
var Promise = require('bluebird');
var Source = require('./api/source/source.model');
var Item = require('./api/item/item.model');
var Thing = require('./api/thing/thing.model');
var mongoose = require('mongoose');
var _ = require('lodash');
var co = require('co');
var crawler = require('./util/crawler');
var logger = require('./util/logger');

var es = require('elasticsearch');
var client = new es.Client({
  host: esConfig.host,
  log: esConfig.loglevel
});


// Connect to database
console.log('mongo uri : ' + config.mongo.uri);
mongoose.connect(config.mongo.uri, config.mongo.options);

var isItemGetting = false;

var getItemJob = new CronJob({
  cronTime: config.itemCron,
  timeZone: config.timeZone,
  onTick: onItemTick,
  onComplete: function () {
    logger.info('item job has completed');
  },
  start: false
});

function onItemTick() {
  var sessionId = new Date();
  if (!isItemGetting) {
    isItemGetting = true;
    co(function* () {
      var sources = yield Source.find({active: true}).exec();
      var items = yield crawler.getItems(sources);

      var count = 0;
      for(idx in items) {
        var item = items[idx];
        var doc = yield Item.findOne({ "url" : item.url }).exec();
        if (!doc) {
          yield Item.create(item);
          count++;
        }
      }
      logger.info('finished item crawling, inserted ' + count + ' items');
    }).then(function () {
      isItemGetting = false;
    }).catch(function (err) {
      onerror(err);
      isItemGetting = false;
    });
  } else {
    logger.info('[' + sessionId + '] item is now getting, ignore this one');
  }
}

function onerror(err) {
  // log any uncaught errors
  // co will not throw any errors you do not handle!!!
  // HANDLE ALL YOUR ERRORS!!!
  logger.error(err);
  logger.error(err.stack);
}

getItemJob.start();


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var isThingGetting = false;
//
var getThingJob = new CronJob({
  cronTime: config.thingCron,
  timeZone: config.timeZone,
  onTick: onThingTick,
  onComplete: function () {
    logger.info('thing job has completed');
  },
  start: false
});
//
getThingJob.start();

function onThingTick() {
  var sessionId = new Date();
  if (!isThingGetting) {
    isThingGetting = true;
    co(function* () {
      var items = yield Item.find({crawled: false}).limit(2).exec();
      var things = yield crawler.getThings(items);
      var savedThings = yield things.map( thing => {
        return Thing.create(thing);
      });

      logger.info("finished thing crawling, inserted " + savedThings.length + " things");

      // count unIndexed thing
      var count = yield Thing.count({ "indexed" : false}).exec();
      logger.info("unindexed thing : " + count);

      // find unindexed thing
      if (count > 0) {
        things = yield Thing.find({ "indexed" : false}).limit(2).exec();
        var indexedThings = yield things.map(t => {
          return Thing.saveEs(t);
        });
        logger.info("indexed " + indexedThings.length +" things");
      }

    }).then(function () {
      isThingGetting = false;
    }).catch(function (err) {
      onerror(err);
      isThingGetting = false;
    });
  } else {
    logger.info('[' + sessionId + '] thing is now getting, ignore this one');
  }
}

logger.info('Crawler has been started, thing cron:' + config.thingCron + ' item cron : ' + config.itemCron);
