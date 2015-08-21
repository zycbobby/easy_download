// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./config/environment');
var CronJob = require('cron').CronJob;
var Promise = require('bluebird');
var Source = Promise.promisifyAll(require('./api/source/source.model'));
var Item = Promise.promisifyAll(require('./api/item/item.model'));
var Thing = Promise.promisifyAll(require('./api/thing/thing.model'));
var mongoose = Promise.promisifyAll(require('mongoose'));
var _ = require('lodash');
var co = require('co');
var crawler = require('./util/crawler');
var logger = require('./util/logger');

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

function* findActiveSource() {
  return Source.find({active: true}).exec();
}

function* insertItem(item) {
  var doc = yield Item.findOne({url: item.url}).exec();
  if (!doc) {
    return Item.create(item);
  } else {
    return Promise.reject();
  }
}

function onItemTick() {
  var sessionId = new Date();
  if (!isItemGetting) {
    isItemGetting = true;
    co(function* () {
      var sources = yield findActiveSource();
      var items = yield crawler.getItems(sources);
      var insertedItems = yield Promise.settle(items.map(item => {
        return co(insertItem(item))
      }));

      logger.info('finished item crawling, inserted ' + insertedItems.filter(item => {
          return item.isFulfilled();
        }).length + ' items');
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
      var items = yield findUnCrawledItem();
      var things = yield crawler.getThings(items);
      var savedThings = yield Promise.settle(things.map( thing => {
        return co(insertThing(thing));
      }));

      logger.info("finished thing crawling, inserted " + savedThings.filter(t => {
          return t.isFulfilled();
        }).length + " things");
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


function* findUnCrawledItem(limit) {
  var _limit  = limit || 10;
  return Item.find({crawled: false}).limit(_limit).exec();
}

function* insertThing(thing) {
  var doc = yield Thing.findOne({source: thing.source}).exec();
  if (!doc) {
    return Thing.create(thing);
  } else {
    return Promise.reject();
  }
}

logger.info('Crawler has been started, thing cron:' + config.thingCron + ' item cron : ' + config.itemCron);
