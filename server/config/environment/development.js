'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost:27017/easydownload-dev'
  },

  itemCron: '*/5 * * * * *',
  thingCron: '*/10 * * * * *',
  esCron: '*/20 * * * * *',

  elasticSearch: {
    host: 'localhost:9200',
    index: 'mongoindex',
    type: 'thing',
    loglevel: 'trace',

    "ikAugAnalyzer": {
      "analysis": {
        "analyzer": {
          "ik_aug": {
            "type": "custom"
            , "tokenizer" : "ik"
            , "use_smart" : true
          }
        }
      }
    },

    mapping: {
      "thing": {
        "_all": {
          "indexAnalyzer": "ik_aug",
          "searchAnalyzer": "ik_aug",
          "term_vector": "no",
          "store": "false"
        },
        "properties": {
          "title": {
            "type": "string",
            "store": "no",
            "term_vector": "with_positions_offsets",
            "indexAnalyzer": "ik_aug",
            "searchAnalyzer": "ik_aug",
            "include_in_all": "true",
            "boost": 8
          }
        }
      }
    }
  },

  seedDB: true
};
