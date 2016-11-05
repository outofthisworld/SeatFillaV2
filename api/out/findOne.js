
var actionUtil = require('../blueprints/actionUtil')


module.exports = function findOneRecord (req) {

  var Model = actionUtil.parseModel(req);
  var pk = actionUtil.requirePk(req);

  var query = Model.findOne(pk);
  query = actionUtil.populateRequest(query, req);
  query.exec(function found(err, matchingRecord) {
    if (err) return Promise.reject(err);
    if(!matchingRecord) return Promise.reject(new Error('Record not found'));

    if (req._sails.hooks.pubsub && req.isSocket) {
      Model.subscribe(req, matchingRecord);
      actionUtil.subscribeDeep(req, matchingRecord);
    }

      return Promise.resolve(matchingRecord);
  });
};
