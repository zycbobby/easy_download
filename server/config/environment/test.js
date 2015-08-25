'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: process.env.MONGOLAB_URI || 'mongodb://localhost:27017/easydownload-test'
  },

  itemCron: '*/5 * * * * *',
  thingCron: '*/10 * * * * *',
  esCron: '*/20 * * * * *',
  seedDB: false,


  elasticSearch: {
    host: 'es.misscatandzuozuo.info',
    index: 'mongoindex',
    type: 'thing',
    loglevel: 'warning',
    scanLimit : 30,

    notInsert: true,

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
};
