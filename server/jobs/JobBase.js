
var logger = require('../util/logger');
var assert = require('assert');

/**
 *
 * @param jobName
 * @constructor
 */
function Job(jobName) {
  this.jobName = '[' + jobName + ']';
}

Job.prototype.onError = function(err){

  logger.error(err);
  logger.error(err.stack);
  logger.error('[' + this.jobName +
    '] encounter error');
};


Job.prototype.start = function() {
  assert(this.job);
  this.job.start();
};

module.exports = Job;
