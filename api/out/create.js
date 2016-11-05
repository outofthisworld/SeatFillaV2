var actionUtil = require('../blueprints/actionUtil')
var _find = require('./find')
var _actionUtilExtended = require('./actionUtilExtended')

module.exports = function createRecord (req, eventObj) {
  var Model = actionUtil.parseModel(req)
  const eventName = req.options.model || req.options.controller;

  // Create data object (monolithic combination of all parameters)
  // Omit the blacklisted params (like JSONP callback param, etc.)
  var data = actionUtil.parseValues(req)

  sails.log.debug('Data in create module: ' + JSON.stringify(data))

  // Create new instance of model using data from params
  return Model.create(data).then(function (newInstance) {
    // If we have the pubsub hook, use the model class's publish method
    // to notify all subscribers about the created item
    if (req._sails.hooks.pubsub) {
      if (req.isSocket) {
        sails.log.debug('Creating, req is socket')
        Model.subscribe(req, newInstance)
        Model.introduce(newInstance)
      }

      // hax0rs the framework cuhz its stupid >.....<!!!!!!!!
      req.setParam('where',{})
      const pk = _actionUtilExtended.coercePK(Model)
      sails.log.debug('Pk key was :' + pk)
      req.query.where[pk] = newInstance[pk]
      sails.log.debug(JSON.stringify(req.allParams()))

      sails.log.debug(req.options)

      return _find(req).then(function (data) {
        data = data[0]

        var publishData = data

        const promise = function (data) {
          // Make sure data is JSON-serializable before publishing            
          publishData = _.isArray(data) ?
            _.map(data, function (instance) {
              return instance.toJSON()
            }) : data.toJSON()

          sails.log.debug('Publishing create..')
          sails.log.debug('Sending create event to all members in room : ' + eventName)
          sails.log.debug('Event name was ' + eventName + '.create')

          sails.sockets.broadcast(eventName, eventName + '.create', publishData)
          Model.publishCreate(publishData, !req.options.mirror && req)

          return data;
        }

        if (eventObj && eventObj.on && eventObj.on.beforeSendToSocket &&
          typeof eventObj.on.beforeSendToSocket === 'function') {
          eventObj.on.beforeSendToSocket(data, function (err, newData) {
            if (err) {
              sails.log.error(err)
              // Try to clean up..
              return Model.destroy(data).then(function () {})
            } else {
              sails.log.debug('New data after modify : ' + JSON.stringify(newData));
              return Promise.resolve(promise(newData));
            }
          })
        }else{
            promise(data)
        }
        
        return Promise.resolve(data)
      })
    }
    return Promise.resolve(newInstance)
  })
}
