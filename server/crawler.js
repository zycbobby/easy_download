// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var config = require('./config/environment');
var logger = require('./util/logger');

// Connect to database
console.log('mongo uri : ' + config.mongo.uri);
require('./config/mongoConnection.js');

var ItemJob = require('./jobs/crawlItemJob');
var itemJob = new ItemJob();
itemJob.start();

var ThingJob = require('./jobs/crawlThingJob');
var thingJob = new ThingJob();
thingJob.start();

logger.info('Crawler has been started, thing cron:' + config.thingCron + ' item cron : ' + config.itemCron);


module.exports = {
  itemJob : itemJob,
  thingJob: thingJob
};
