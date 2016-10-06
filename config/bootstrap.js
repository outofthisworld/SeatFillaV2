/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */


const timeUtils = require('../api/utils/TimeUtils');
module.exports.bootstrap = function(callback) {
    sails.config.scheduledtasks.forEach(function(task) {
        try {
            ScheduledExecutorService.execute(task.task, task.initialDelay, task.repeatingDelay);
        } catch (err) {
            sails.log.err('Error bootstrapping scheduled task in bootstrap.js');
            sails.log.err(err);
        }
    });
    callback();
};