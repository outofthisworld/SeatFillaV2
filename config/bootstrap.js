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



module.exports.bootstrap = function(callback) {

    sails.log.debug('===================================')
    sails.log.debug('Welcome to the Seatfilla backend');
    sails.log.debug('Created by: Dale and Richard');
    sails.log.debug('===================================')

    /*Initialize any scheduled tasks*/
    sails.config.scheduledtasks();

    /* Initialize any global caches */
    sails.config.globalcaches();

    callback();
};