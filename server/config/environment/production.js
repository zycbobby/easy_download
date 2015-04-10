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
    'mongodb://localhost/easydownload'
  },


  elasticSearch : {
    host : process.env.ELASTICSEARCH_URI || 'localhost:9200',
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


  itemCron: process.env.ITEM_CRON || '0 */5 9-23 * * *',
  thingCron: process.env.THING_CRON || '0 */20 9-23 * * *',
  timeZone: 'Asia/Shanghai',
  esCron : '0 0 0-8 * * *'
};
