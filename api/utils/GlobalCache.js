/*
    A basic cache implementation for storing global data accross services.

    At this present stage data decays due to certain expiration policies,
    given time in the future support may be added for alternating between different
    storage mechanisms.
    
    Ideas:
    1) Switching in and out of process memory and database
    2) File based storage for json objects, serialize least accessed data items to file,
     whilst leaving the more frequently accessed items in memory
    3) Add support for memory based expiration policies
    4) Generic store method so that implementation does not matter and items can be serialized in any way.

    
    for the caches so that memory is not wasted.

    Created by Dale.
*/

const temp = require('temp'),
  fs = require('fs'),
  util = require('util'),
  exec = require('child_process').exec

/*
    Stores global cache implementations.
*/
const cacheObj = cacheObj || {}

function GlobalCache (options) {
  if (!options) throw new Error('Invalid object passed to GlobalCache.js GlobalCache constructor')

  const _self = this

  _self.key = options.GlobalCache
  _self.ExpirationSettings = options.ExpirationSettings || {}
  _self.Data = options.Data || {}
  _self.UseSecondaryStorage = options.UseSecondaryStorage || true
}

GlobalCache.prototype.getKey = function () {
  const _self = this

  return _self.key
}

GlobalCache.prototype.checkKeyExists = function (key) {
  const _self = this

  if (!cacheObj || !cacheObj[_self.key] || !cacheObj[_self.key] || !cacheObj[_self.key].cache || !cacheObj[_self.key].cache.Data)
    throw new Error('Invalid state for GlobalCache in GlobalCache.js/checkKeyExists')

  if (_self.Data[key]) {
    return true
  }

  return false
}

GlobalCache.prototype.setKey = function (key) {
  const _self = this

  if (!(_self.key in cacheObj)) {
    cacheObj[_self.key] = this
  }

  const obj = cacheObj[_self.key]
  delete cacheObj[_self.key]

  cacheObj[key] = obj
}

GlobalCache.prototype.getDataObject = function (key) {
  const _self = this

  if (_self.checkKeyExists(key)) {
    return _self.Data[key]
  } else {
    return null
  }
}

GlobalCache.prototype.setLastAccessed = function (key, date) {
  const _self = this

  if (_self.checkKeyExists(key)) {
    _self.Data[key].lastAccessed = date
    return true
  } else {
    return false
  }
}

GlobalCache.prototype.getLastAccessed = function (key) {
  const _self = this

  if (_self.checkKeyExists(key)) {
    return _self.Data[key].lastAccessed
  } else {
    return null
  }
}

GlobalCache.prototype.getLastModified = function (key) {
  const _self = this

  if (_self.checkKeyExists(key)) {
    _self.Data[key].lastModified
  } else {
    return null
  }
}

GlobalCache.prototype.setLastModified = function (key, date) {
  const _self = this

  if (_self.checkKeyExists(key)) {
    _self.Data[key].lastModified = date
    return true
  } else {
    return false
  }
}

GlobalCache.prototype.getInsertationTime = function (key) {
  const _self = this

  if (_self.checkKeyExists(key)) {
    return _self.Data[key].insertationTime
  } else {
    return null
  }
}

GlobalCache.prototype.setInsertationTime = function (key, date) {
  const _self = this

  if (_self.checkKeyExists(key)) {
    _self.Data[key].insertationTime = date
    return true
  } else {
    return false
  }
}

GlobalCache.prototype.getData = function (key) {
  const _self = this

  if (_self.checkKeyExists(key)) {
    // Run the expiration policy on the data to make sure that the data being retrievied is 'clean'
    sails.log.debug('GlobalCache (' + _self.key + ') deleting ' + key + ' if it has expired. (getData())')

    if (_self.deleteIfExpired(key)) {
      sails.log.debug('GlobalCache: (' + _self.key + '):' + ' key ' +
        key + 'has now expired and will be removed from the cache. (getData())')
      return null
    } else {
      sails.log.debug('GlobalCache: (' + _self.key + '): returning existing result for key: ' + key)
      _self.Data[key].lastAccessed = new Date()
      return _self.Data[key].value
    }
  } else {
    sails.log.debug('GlobalCache: (' + _self.key + '): looked up not existent key ' + key)
    return null
  }
}

GlobalCache.prototype.removeData = function (key) {
  const _self = this

  if (_self.checkKeyExists(key)) {
    if (_self.ExpirationSettings.runExpirationPolicyOnDeletions &&
      typeof _self.ExpirationSettings.runExpirationPolicyOnDeletions == 'function' &&
      _self.ExpirationSettings.runExpirationPolicyOnDeletions())
      _self.runExpirationPolicy()

    delete _self.Data[key]
    return true
  } else {
    return false
  }
}

GlobalCache.prototype.insertData = function (key, data) {
  const _self = this

  if (_self.ExpirationSettings.runExpirationPolicyOnInserts &&
    typeof _self.ExpirationSettings.runExpirationPolicyOnInserts == 'function' &&
    _self.ExpirationSettings.runExpirationPolicyOnInserts())
    _self.runExpirationPolicy()

  if ('Data' in cacheObj[_self.key].cache) {
    const dataObject = {
      value: data,
      insertationTime: new Date(),
      lastAccessedTime: null,
      lastModifiedTime: null
    }
    _self.Data[key] = dataObject
  } else {
    throw new Error('Invalid object state for GlobalCache in GlobalCache.js/insertData, Data object must be defined.')
  }
}

GlobalCache.prototype.setData = function (key, data) {
  const _self = this

  if (_self.checkKeyExists(key)) {
    _self.Data[key].lastModifiedTime = new Date()
    _self.Data[key].value = data
  } else {
    return _self.insertData(key, data)
  }
}

GlobalCache.prototype.checkExpired = function (key) {
  const _self = this

  if (!_self.expirationPolicies || !_self.checkKeyExists(key)) return false

  sails.log.debug('GlobalCache (' + _self.key + '): checking if ' + key + ' has expired')
  _self.expirationPolicies.forEach((expirationPolicy) => {
    if (typeof expirationPolicy == 'function' && expirationPolicy(_self.Data[key])) {
      return true
    }
  })
  return false
}

GlobalCache.prototype.deleteIfExpired = function (key) {
  const _self = this

  if (_self.checkExpired(cacheObj[_self.key].cache['Data'][key])) {
    delete _self.Data[key]
    return true
  } else {
    sails.log.debug('GlobalCache (' + _self.key + '): ' + key + ' has not expired')
  }

  return false
}

GlobalCache.prototype.deleteCache = function () {
  const _self = this

  _self.stopScheduledExpirationPolicy()
  _self.runExpirationPolicy()
  delete cacheObj[_self.key]
}

GlobalCache.prototype.setExpirationPolicies = function (obj) {
  const _self = this

  if (!Array.isArray(obj)) throw new Error('Invalid object passed to GlobalCache.js/setExpirationPolicies, must be an array')

  obj.forEach(function (expiriationPolicy) {
    if (!(typeof expiriationPolicy == 'function')) {
      throw new Error('Invalid type passed to setExpirationPolicy in GlobalCache.js')
    }
  })

  _self.expirationPolicies = obj
}

GlobalCache.prototype.setRefreshPolicy = function (refreshPolicy) {
  const _self = this

  if (!refreshPolicy || typeof refreshPolicy != 'function') {
    throw new Error('Invalid object passed to GlobalCache.js/setRefreshPolicy, must be a function')
  }

  _self.refreshPolicy = refreshPolicy
}

GlobalCache.prototype.stopScheduledExpirationPolicy = function () {
  const _self = this

  if (!_self.ScheduledTask) return

  ScheduledExecutorService.stopScheduledTask(cacheObj[_self.key].ScheduledTask.clearIntervalKey)
}

GlobalCache.prototype.runExpirationPolicy = function () {
  const _self = this

  if (!_self.expirationPolicies && !_self.secondaryStoragePolicies) return

  new Promise(function (resolve, reject) {
    if ('Data' in _self) {
      for (var key in _self['Data']) {
        if (_self['Data'].hasOwnProperty(key)) {
          const wasDeleted = false

          if (_self.deleteIfExpired(key)) {
            sails.log.debug('GlobalCache: (' + _self.key + '):' + ' key: ' +
              key + 'has now expired and will be removed from the cache.')
            wasDeleted = true

            if (_self.refreshPolicy) {
              _self.refreshPolicy(key)
              wasDeleted = false
            }
          }

          // pass to storagePolicies size of cache, total free memory, sizeOfDataItemm
          if (!wasDeleted && cacheObj[_self.key].useSecondaryStorage &&
            _self.shouldMoveToSecondaryStorage(_self.Data[key])) {
            try {
              if (_self.store(_self.serialize(_self.Data[key]))) {
                // Handle stored item, delete it from memory or whatever
              }
            } catch (err) {
              sails.log.error(err)
              sails.log.debug('Error when trying to store/serialize object in GlobalCache ( ' + _self.key + '), key was ' + key + ' data was ' + _self.Data[key])
            }
          }
        }
      }
      resolve(true)
    } else {
      reject(new Error('Invalid state for cache ' + _self.key + ' in GlobalCache.js/runExpirationPolicy'))
    }
  }).catch(function (err) {
    sails.log.error(err)
  })
}

GlobalCache.prototype.serialize = function (dataItem) {
  try {
    return JSON.stringify(dataItem)
  } catch (err) {
    throw err
  }
}

GlobalCache.prototype.deserialize = function (dataItem) {
  try {
    return JSON.parse(dataItem)
  } catch (err) {
    throw err
  }
}

GlobalCache.prototype.store = function (dataItem) {
  try {
    return JSON.parse(dataItem)
  } catch (err) {
    throw err
  }
}

GlobalCache.prototype.retrieve = function (dataItem, cache) {
  try {
    return JSON.parse(dataItem)
  } catch (err) {
    throw err
  }
}

module.exports = {
  cache(object) {
    if (!object || !object.GlobalCache) {
      throw new Error('Invalid params to exported function in GlobalCache.js. Object and Object.globalCache must exist')
    } else if (object.GlobalCache in cacheObj) {
      sails.log.debug('Retrieving global cache: ' + object.GlobalCache)
      return cacheObj[object.GlobalCache].cache
    } else {
      sails.log.debug('Creating new global cache: ' + object.GlobalCache)

      var cache = new GlobalCache(object)

      cacheObj[object.GlobalCache] = {
      cache}

      if (object.ExpirationPolicies) {
        cache.setExpirationPolicies(object.ExpirationPolicies)

        if (object.ExpirationSettings &&
          (object.ExpirationSettings.ScheduledExpirationPolicyInterval ||
          object.ExpirationSettings.ScheduledExpirationPolicyDelay)) {
          const interval = object.ExpirationSettings.ScheduledExpirationPolicyInterval ?
            object.ExpirationSettings.ScheduledExpirationPolicyInterval.toMilliseconds() : 0

          const delay = object.ExpirationSettings.ScheduledExpirationIntialDelay ?
            object.ExpirationSettings.ScheduledExpirationIntialDelay.toMilliseconds() : 0

          const scheduledTask = ScheduledExecutorService.execute({
            key: object.GlobalCache + '-GlobalCache',
            on: {
              executionBegan(date) {
                sails.log.debug('Running expiration policy for cache ' +
                  object.GlobalCache + ' on ' + date)
              },
              executionFinished(date, output) {
                sails.log.debug('Finished running expiration policy for cache ' +
                  object.GlobalCache + ' on ' + date)
              },
              error(date, error) {
                sails.log.debug('Error running expiration policy for cache ' +
                  object.GlobalCache + ' on ' + date)
              },
              stop(date) {
                sails.log.debug('Stopped scheduled task of global cache ' +
                  object.GlobalCache)
              }
            },
            work() {
              cache.runExpirationPolicy()
            },
            maxExecutions: 0
          }, interval, delay)

          sails.log.debug('Succesfully scheduled ' + object.GlobalCache + ' expiration policy to run every ' +
            interval.getValue() + ' ms with an initial delay of ' + delay.getValue() + ' ms ')

          cacheObj[object.GlobalCache].ScheduledTask = scheduledTask
        }
      }
    }
    return cacheObj[object.GlobalCache].cache
  },
  ExpirationPolicies: {
    greaterThan(timeUnit, dataItemAttribute) {
      return function (dataItem) {
        if (!(dataItemAttribute in dataItem))
          throw new Error('Invalid attribute ' + dataItemAttribute + ' for expiration policy')

        if (!(dataItem[dataItemAttribute] instanceof Date))
          throw new Error('Invalid type of attribute for GlobalCache data item expiration policy, must be a date, attribute was ' + dataItemAttribute)

        if (new Date().getTime() - dataItem[dataItemAttribute].getTime() > timeUnit.toMilliseconds()) {
          return true
        }

        return false
      }
    },
    lessThan(timeUnit, dataItemAttribute) {
      return function (dataItem, dataItemAttribute) {
        if (!(dataItemAttribute in dataItem))
          throw new Error('Invalid attribute ' + dataItemAttribute + ' for expiration policy')

        if (!(dataItem[dataItemAttribute] instanceof Date))
          throw new Error('Invalid type of attribute for GlobalCache data item expiration policy, must be a date, attribute was ' + dataItemAttribute)

        if (new Date().getTime() - dataItem[dataItemAttribute].getTime() < timeUnit.toMilliseconds()) {
          return true
        }
        return false
      }
    },
    greaterThanOrEqualTo(timeUnit, dataItemAttribute) {
      return function (dataItem) {
        if (!(dataItemAttribute in dataItem))
          throw new Error('Invalid attribute ' + dataItemAttribute + ' for expiration policy')

        if (!(dataItem[dataItemAttribute] instanceof Date))
          throw new Error('Invalid type of attribute for GlobalCache data item expiration policy, must be a date, attribute was ' + dataItemAttribute)

        if (new Date().getTime() - dataItem[dataItemAttribute].getTime() >= timeUnit.toMilliseconds()) {
          return true
        }
        return false
      }
    },
    lessThanOrEqualTo(timeUnit, dataItemAttribute) {
      return function (dataItem) {
        if (!(dataItemAttribute in dataItem))
          throw new Error('Invalid attribute ' + dataItemAttribute + ' for expiration policy')

        if (!(dataItem[dataItemAttribute] instanceof Date))
          throw new Error('Invalid type of attribute for GlobalCache data item expiration policy, must be a date, attribute was ' + dataItemAttribute)

        if (new Date().getTime() - dataItem[dataItemAttribute].getTime() <= timeUnit.toMilliseconds()) {
          return true
        }
        return false
      }
    },
    equalTo(timeUnit, dataItemAttribute) {
      return function (dataItem, dataItemAttribute) {
        if (!(dataItemAttribute in dataItem))
          throw new Error('Invalid attribute ' + dataItemAttribute + ' for expiration policy')

        if (!(dataItem[dataItemAttribute] instanceof Date))
          throw new Error('Invalid type of attribute for GlobalCache data item expiration policy, must be a date, attribute was ' + dataItemAttribute)

        if (new Date().getTime() - dataItem[dataItemAttribute].getTime() == timeUnit.toMilliseconds()) {
          return true
        }
        return false
      }
    },
    /*
        An expiration policy that removes a cached item should it be accessed in less than the specified time.
    */
    lastAccessedLessThan(timeUnit) {
      return this.lessThan(timeUnit, 'lastAccessed')
    },
    /*
        An expiration policy that removes a cached item should it have been accessed in less or equal to the specified time.
    */
    lastAccessedLessThanOrEqualTo(timeUnit) {
      return this.lessThanOrEqualTo(timeUnit, 'lastAccessed')
    },
    /*
        An expiration policy that removes a cached item should it have been accessed in a time amounting to more than the specified time.
    */
    lastAccessedGreaterThan(timeUnit) {
      return this.greaterThan(timeUnit, 'lastAccessed')
    },
    /*
        An expiration policy that removes a cached item should it have been accessed in a time amounting to more than the specified time.
    */
    lastAccessedGreaterThanOrEqualTo(timeUnit) {
      return this.greaterThanOrEqualTo(timeUnit, 'lastAccessed')
    },
    /*
        An expiration policy that removes a cached item should it have been accessed equal to the given time.
    */
    lastAccessedEqualTo(timeUnit) {
      return this.equalTo(timeUnit, 'lastAccessed')
    },
    /*
        An expiration policy that removes a cached item should its insertation time execeed the specified time unit.
    */
    insertedLessThan(timeUnit) {
      return this.lessThan(timeUnit, 'insertationTime')
    },
    /*
        An expiration policy that removes a cached item should its insertation time be less than or equal to the specified time unit.
    */
    insertedLessThanOrEqualTo(timeUnit) {
      return this.lessThanOrEqualTo(timeUnit, 'insertationTime')
    },
    /*
        An expiration policy that removes a cached item should its insertation time be greater than the specified time unit.
    */
    insertedGreaterThan(timeUnit) {
      return this.greaterThan(timeUnit, 'insertationTime')
    },
    /*
        An expiration policy that removes a cached item should its insertation time be greater than or equal to the specified time unit.
    */
    insertedGreaterThanOrEqualTo(timeUnit) {
      return this.greaterThanOrEqualTo(timeUnit, 'insertationTime')
    },
    /*
        An expiration policy that removes a cached item should its insertation time equal to the specified time unit.
    */
    insertedEqualTo(timeUnit) {
      return this.equalTo(timeUnit, 'insertationTime')
    }
  }
}
