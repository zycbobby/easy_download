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

  seedDB: true
};
