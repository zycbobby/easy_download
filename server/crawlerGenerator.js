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
var co =  require('co');

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
  onTick: onTick,
  onComplete: function () {
    logger.info('item job has completed');
  },
  start: false
});

function findActiveSource() {
  return new Promise(function (fulfill, reject) {
    Source.find({active: true}).exec(function (err, sources) {
      if (err) reject(err);
      logger.info('get ' + sources.length + ' sources');
      fulfill(sources);
    });
  });
}


function onTick() {
  var sessionId = new Date();
  if (!isItemGetting) {
    isItemGetting = true;
    var sourceIter = findActiveSource();
    console.log(sourceIter.next().value);
    isItemGetting = false;
  } else {
    logger.info('[' + sessionId + ']item is now getting, ignore this one : ' + new Date());
  }
}


co(function* (){
  return yield Promise.resolve(findActiveSource());
}).then(function(sources) {
  console.log(sources);
});


function onTick1() {
  var sessionId = new Date();
  if (!isItemGetting) {
    isItemGetting = true;
    Q().then(function () {
      var defer = Q.defer();
      var results = [];
      Source.find({active: true}).exec(function (err, sources) {
        logger.info('get ' + sources.length + ' sources');
        async.each(sources, function (source, cb) {
          source.getItems().then(function (items) {
            results.push(items);
            cb(null);
          }, function (err) {
            cb(null);
          });
        }, function (err) {
          if (err) throw err;
          defer.resolve(results);
        })
      });
      return defer.promise;
    }).then(function (itemsArray) {
      var flatten = _.flatten(itemsArray);
      logger.info('[' + sessionId + '] get ' + flatten.length + ' items');

      var defer = Q.defer();
      async.map(flatten, function (item, cb) {
        Item.findOne({url: item.url}).exec(function (err, doc) {
          if (err) throw err;
          if (!doc) {
            Item.create(item, cb);
          } else {
            cb();
          }
        });
      }, function (err, results) {
        if (err) throw err;
        logger.info('[' + sessionId + '] insert ' + results.filter(function (r) {
            return !!r
          }).length + ' items');
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
}

// getItemJob.start();
