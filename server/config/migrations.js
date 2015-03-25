/**
 * Created by zuo on 15-3-25.
 */

var devConfig = require('./environment/development');

module.exports = {
  development: {
    schema: {'migration': {}},
    modelName: 'Migration',
    db: process.env.MONGOHQ_URL || devConfig.mongo.uri
  },
  test: {},
  production: {}
};
