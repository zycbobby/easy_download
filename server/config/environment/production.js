'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip: process.env.OPENSHIFT_NODEJS_IP ||
  process.env.IP ||
  undefined,

  // Server port
  port: process.env.OPENSHIFT_NODEJS_PORT ||
  process.env.PORT ||
  8080,

  // MongoDB connection options
  mongo: {
    uri: process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME ||
    'mongodb://localhost:27017/easydownload'
  },

  elasticSearch : {
    host : process.env.ELASTICSEARCH_URI || 'zuo:22216785@es.misscatandzuozuo.info',
    index : 'mongoindex',
    type: 'thing',
    loglevel : 'trace',
    scanLimit : 300,
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


  itemCron: process.env.ITEM_CRON || '0 */5 9-23 * * *',
  thingCron: process.env.THING_CRON || '0 */20 9-23 * * *',
  timeZone: 'Asia/Shanghai',
  esCron : process.env.ES_CRON || '0 0 0-8 * * *'
};
