'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost:27017/easydownload-dev'
  },

  itemCron : '*/5 * * * * *',
  thingCron : '*/10 * * * * *',
  esCron : '*/20 * * * * *',

  elasticSearch : {
    host : 'localhost:9200',
    index : 'mongoindex',
    type: 'thing',
    loglevel : 'trace'
  },

  seedDB: true
};
