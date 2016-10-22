var actionUtil = require('../blueprints/actionUtil');

module.exports = function createRecord (req) {

    var Model = actionUtil.parseModel(req);
    sails.log.debug(Model);

    // Create data object (monolithic combination of all parameters)
    // Omit the blacklisted params (like JSONP callback param, etc.)
    var data = actionUtil.parseValues(req);

    sails.log.debug(data);

    // Create new instance of model using data from params
    Model.create(data).then(function(newInstance){
        // If we have the pubsub hook, use the model class's publish method
        // to notify all subscribers about the created item
        if (req._sails.hooks.pubsub) {
            if (req.isSocket) {
                Model.subscribe(req, newInstance);
                Model.introduce(newInstance);
            }
            // Make sure data is JSON-serializable before publishing            
            var publishData = _.isArray(newInstance) ? 
                                _.map(newInstance, function(instance) {return instance.toJSON();}) : 
                                newInstance.toJSON();

            Model.publishCreate(publishData, !req.options.mirror && req);
        }

        return Promise.resolve(newInstance);
    })
};
