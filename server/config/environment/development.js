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
    loglevel : 'trace',
    mapping : {
      "thing": {
        "_all": {
          "indexAnalyzer": "ik",
          "searchAnalyzer": "ik",
          "term_vector": "no",
          "store": "false"
        },
        "properties": {
          "title": {
            "type": "string",
            "store": "no",
            "term_vector": "with_positions_offsets",
            "indexAnalyzer": "ik",
            "searchAnalyzer": "ik",
            "include_in_all": "true",
            "boost": 8
          }
        }
      }
    }
  },

  seedDB: true
};
