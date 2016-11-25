/**
 * Module dependencies
 */
var actionUtil = require('../blueprints/actionUtil');
_ = require('lodash');

/**
 * Find Records
 *
 *  get   /:modelIdentity
 *   *    /:modelIdentity/find
 *
 * Optional:
 * @param {Object} where       - the find criteria (passed directly to the ORM)
 * @param {Integer} limit      - the maximum number of records to send back (useful for pagination)
 * @param {Integer} skip       - the number of records to skip (useful for pagination)
 * @param {String} sort        - the order of returned records, e.g. `name ASC` or `age DESC`
 * @param {String} callback - default jsonp callback param (i.e. the name of the js function returned)
 */

module.exports = function findRecords(req, res) {

    // Look up the model
    var Model = actionUtil.parseModel(req);


    // If an `id` param was specified, use the findOne blueprint action
    // to grab the particular instance with its primary key === the value
    // of the `id` param.   (mainly here for compatibility for 0.9, where
    // there was no separate `findOne` action)
    if (actionUtil.parsePk(req)) {
        return require('./findOne')(req, res);
    }

    // Lookup for records that match the specified criteria
    var query = Model.find()
        .where(actionUtil.parseCriteria(req))
        .limit(actionUtil.parseLimit(req))
        .skip(actionUtil.parseSkip(req))
        .sort(actionUtil.parseSort(req));


    query = actionUtil.populateRequest(query, req, Model);


    return query.then(function found(matchingRecords) {

        // Only `.watch()` for new instances of the model if
        // `autoWatch` is enabled.
        if (req._sails.hooks.pubsub && req.isSocket) {
            sails.log.debug('Subscibing model to all records');
            Model.subscribe(req, matchingRecords);
            if (req.options.autoWatch) {
                sails.log.debug('Auto Watching (socket request) ' + sails.sockets.getId(req) + ' req.options :' + JSON.stringify(req.options))
                Model.watch(req);
            }

            sails.log.debug('Joining socket room :' + req.options.model);
            sails.sockets.join(req, req.options.model || req.options.controller);

            // Also subscribe to instances of all associated models
            _.each(matchingRecords, function(record) {
                actionUtil.subscribeDeep(req, record);
            });
        }
        return Promise.resolve(matchingRecords);
    });
};