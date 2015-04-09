'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost:31000/easydownload-dev'
  },

  itemCron : '*/5 * * * * *',
  thingCron : '*/10 * * * * *',

  elasticSearch : {
    host : 'localhost:9200',
    index : 'mongoindex',
    type: 'thing'
  },

  seedDB: true
};
