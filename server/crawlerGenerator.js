// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var mongoose = require('mongoose');
var config = require('./config/environment');
var CronJob = require('cron').CronJob;
var Source = require('./api/source/source.model');
var Item = require('./api/item/item.model');
var Thing = require('./api/thing/thing.model');
var _ = require('lodash');
var co = require('co');

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
    co(function* () {
      var sources = yield Promise.resolve(findActiveSource());
      var itemsBelongToSource = yield Promise.all(sources.map(src => {
        return src.getItems();
      }));

      var insertedItems = yield Promise.all(_.flatten(itemsBelongToSource).map(item => {
        return new Promise(function (fulfil, reject) {
          Item.findOne({url: item.url}).exec(function (err, doc) {
            if (err) reject(err);
            if (!doc) {
              Item.create(item, function (err, doc) {
                if (err) reject(err);
                fulfil( {
                  value : 1,
                  msg : item.url
                });
              });
            } else {
              fulfil( {
                value : 0,
                msg : item.url
              });
            }
          });
        });
      }));
      logger.info('finished, inserted ' + insertedItems.filter(item => { return item.value === 1; }).length + ' items');

    }).then(function() {
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
  console.error(err.stack);
}

getItemJob.start();
