/*
    A basic cache implementation for storing global data accross services.

    Created by Dale.
*/

/*
    Stores global cache implementations.
*/
const cacheObj = cacheObj || {}

/*
    Some default cache data expiration policies.
*/

function GlobalCache (options) {
  if (!options) throw new Error('Invalid object passed to GlobalCache.js GlobalCache constructor')

  this.key = options.GlobalCache
  this.ExpirationSettings = options.ExpirationSettings || {}
  this.Data = options.Data || {}
}

GlobalCache.prototype.getKey = function () {
  return this.key
}

GlobalCache.prototype.checkKeyExists = function (key) {
  if (!cacheObj || !cacheObj[this.key] || !cacheObj[this.key] || !cacheObj[this.key].cache || !cacheObj[this.key].cache.Data)
    throw new Error('Invalid state for GlobalCache in GlobalCache.js/checkKeyExists')

  if (cacheObj[this.key].cache.Data[key]) {
    return true
  }

  return false
}

GlobalCache.prototype.setKey = function (key) {
  if (!(this.key in cacheObj)) {
    cacheObj[this.key] = this
  }

  const obj = cacheObj[this.key]
  delete cacheObj[this.key]

  cacheObj[key] = obj
}

GlobalCache.prototype.getDataObject = function (key) {
  if (this.checkKeyExists(key)) {
    return cacheObj[this.key]['Data'][key]
  } else {
    return null
  }
}

GlobalCache.prototype.setLastAccessed = function (key, date) {
  if (this.checkKeyExists(key)) {
    cacheObj[this.key].cache.Data[key].lastAccessed = date
    return true
  } else {
    return false
  }
}

GlobalCache.prototype.getLastAccessed = function (key) {
  if (this.checkKeyExists(key)) {
    return cacheObj[this.key].cache.Data[key].lastAccessed
  } else {
    return null
  }
}

GlobalCache.prototype.getLastModified = function (key) {
  if (this.checkKeyExists(key)) {
    cacheObj[this.key].cache.Data[key].lastModified
  } else {
    return null
  }
}

GlobalCache.prototype.setLastModified = function (key, date) {
  if (this.checkKeyExists(key)) {
    cacheObj[this.key].cache.Data[key].lastModified = date
    return true
  } else {
    return false
  }
}

GlobalCache.prototype.getInsertationTime = function (key) {
  if (this.checkKeyExists(key)) {
    return cacheObj[this.key].cache.Data[key].insertationTime
  } else {
    return null
  }
}

GlobalCache.prototype.setInsertationTime = function (key, date) {
  if (this.checkKeyExists(key)) {
    cacheObj[this.key].cache.Data[key].insertationTime = date
    return true
  } else {
    return false
  }
}

GlobalCache.prototype.getData = function (key) {
  if (this.checkKeyExists(key)) {
    // Run the expiration policy on the data to make sure that the data being retrievied is 'clean'

    if (this.deleteIfExpired(key)) {
      sails.log.debug('GlobalCache: (' + this.key + '):' + ' key ' +
        key + 'has now expired and will be removed from the cache. (getData())')
      return null
    } else {
      sails.log.debug('GlobalCache: (' + this.key + '): returning existing result for key: ' + key)
      cacheObj[this.key]['Data'][key].lastAccessed = new Date()
      return cacheObj[this.key].cache.Data[key].value
    }
  } else {
    sails.log.debug('GlobalCache: (' + this.key + '): looked up not existent key ' + key)
    return null
  }
}

GlobalCache.prototype.removeData = function (key) {
  if (this.checkKeyExists(key)) {
    delete cacheObj[this.key].cache.Data[key]
    return true
  } else {
    return false
  }
}

GlobalCache.prototype.insertData = function (key, data) {
  if (this.ExpirationSettings.runExpirationPolicyOnInserts &&
    this.ExpirationSettings.runExpirationPolicyOnInserts())
    this.runExpirationPolicy()

  if ('Data' in cacheObj[this.key].cache) {
    const dataObject = {
      value: data,
      insertationTime: new Date(),
      lastAccessedTime: null,
      lastModifiedTime: null
    }
    cacheObj[this.key].cache.Data[key] = dataObject
  } else {
    throw new Error('Invalid object state for GlobalCache in GlobalCache.js/insertData, Data object must be defined.')
  }
}

GlobalCache.prototype.setData = function (key, data) {
  if (this.checkKeyExists(key)) {
    cacheObj[this.key].cache.Data[key].lastModifiedTime = new Date()
    cacheObj[this.key].cache.Data[key].value = data
  } else {
    return this.insertData(key, data)
  }
}

GlobalCache.prototype.checkExpired = function (key) {
  if (!this.expirationPolicies || this.checkKeyExists(key)) return false

  this.expirationPolicies.forEach((expirationPolicy) => {
    if (typeof expirationPolicy == 'function' && expirationPolicy(dataItem)) {
      return true
    }
  })
  return false
}

GlobalCache.prototype.deleteIfExpired = function (key) {
  const _self = this

  if (this.checkExpired(cacheObj[_self.key].cache['Data'][key])) {
    delete cacheObj[_self.key]['cache']['Data'][key]
    return true
  }

  return false
}

GlobalCache.prototype.deleteCache = function () {
  this.stopScheduledExpirationPolicy()
  this.runExpirationPolicy()
  delete cacheObj[this.key]
}

GlobalCache.prototype.setExpirationPolicies = function (obj) {
  if (!Array.isArray(obj)) throw new Error('Invalid object passed to GlobalCache.js/setExpirationPolicies, must be an array')

  obj.forEach(function (expiriationPolicy) {
    if (!(typeof expiriationPolicy == 'function')) {
      throw new Error('Invalid type passed to setExpirationPolicy in GlobalCache.js')
    }
  })

  this.expirationPolicies = obj
}

GlobalCache.prototype.setRefreshPolicy = function (refreshPolicy) {
  if (!refreshPolicy || typeof refreshPolicy != 'function') {
    throw new Error('Invalid object passed to GlobalCache.js/setRefreshPolicy, must be a function')
  }

  this.refreshPolicy = refreshPolicy
}

GlobalCache.prototype.stopScheduledExpirationPolicy = function () {
  if (!cacheObj[this.key].ScheduledTask) return

  ScheduledExecutorService.stopScheduledTask(cacheObj[this.key].ScheduledTask.clearIntervalKey)
}

GlobalCache.prototype.runExpirationPolicy = function () {
  if (!this.expirationPolicies) return

  const _self = this
  new Promise(function (resolve, reject) {
    if ('Data' in _self['Data']) {
      for (var key in _self['Data']) {
        if (_self.hasOwnProperty(key)) {
          if (_self.deleteIfExpired(key)) {
            sails.log.debug('GlobalCache: (' + _self.key + '):' + ' key: ' +
              key + 'has now expired and will be removed from the cache.')

            if (_self.refreshPolicy) {
              _self.refreshPolicy(key)
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

module.exports = {
  Cache(object) {
    if (!object || !object.GlobalCache) {
      throw new Error('Invalid params to exported function in GlobalCache.js. Object and Object.globalCache must exist')
    } else if (object.GlobalCache in cacheObj) {
      sails.log.debug('Retrieving global cache: ' + object.GlobalCache)
      return cacheObj[object.GlobalCache].cache
    } else {
      var cache = new GlobalCache(object)
      cacheObj[object.GlobalCache] = { cache}

      sails.log.debug('Creating new global cache: ' + object.GlobalCache)

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
    return cacheObj[object.GlobalCache]
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
      if (!(dataItemAttribute in dataItem))
        throw new Error('Invalid attribute ' + dataItemAttribute + ' for expiration policy')

      if (!(dataItem[dataItemAttribute] instanceof Date))
        throw new Error('Invalid type of attribute for GlobalCache data item expiration policy, must be a date, attribute was ' + dataItemAttribute)

      return function (dataItem, dataItemAttribute) {
        if (new Date().getTime() - dataItem[dataItemAttribute].getTime() < timeUnit.toMilliseconds()) {
          return true
        }
        return false
      }
    },
    greaterThanOrEqualTo(timeUnit, dataItemAttribute) {
      if (!(dataItemAttribute in dataItem))
        throw new Error('Invalid attribute ' + dataItemAttribute + ' for expiration policy')

      if (!(dataItem[dataItemAttribute] instanceof Date))
        throw new Error('Invalid type of attribute for GlobalCache data item expiration policy, must be a date, attribute was ' + dataItemAttribute)

      return function (dataItem) {
        if (new Date().getTime() - dataItem[dataItemAttribute].getTime() >= timeUnit.toMilliseconds()) {
          return true
        }
        return false
      }
    },
    lessThanOrEqualTo(timeUnit, dataItemAttribute) {
      if (!(dataItemAttribute in dataItem))
        throw new Error('Invalid attribute ' + dataItemAttribute + ' for expiration policy')

      if (!(dataItem[dataItemAttribute] instanceof Date))
        throw new Error('Invalid type of attribute for GlobalCache data item expiration policy, must be a date, attribute was ' + dataItemAttribute)

      return function (dataItem) {
        if (new Date().getTime() - dataItem[dataItemAttribute].getTime() <= timeUnit.toMilliseconds()) {
          return true
        }
        return false
      }
    },
    equalTo(timeUnit, dataItemAttribute) {
      if (!(dataItemAttribute in dataItem))
        throw new Error('Invalid attribute ' + dataItemAttribute + ' for expiration policy')

      if (!(dataItem[dataItemAttribute] instanceof Date))
        throw new Error('Invalid type of attribute for GlobalCache data item expiration policy, must be a date, attribute was ' + dataItemAttribute)

      return function (dataItem, dataItemAttribute) {
        if (new Date().getTime() - dataItem[dataItemAttribute].getTime() == timeUnit.toMilliseconds()) {
          return true
        }
        return false
      }
    },
    /*
        An expiration policy that removes a cached item should it be accessed in less than the specified time.
    */
    LastAccessedLessThan(timeUnit) {
      return this.lessThan(timeUnit, 'lastAccessed')
    },
    /*
        An expiration policy that removes a cached item should it have been accessed in less or equal to the specified time.
    */
    LastAccessedLessThanOrEqualTo(timeUnit) {
      return this.lessThanOrEqualTo(timeUnit, 'lastAccessed')
    },
    /*
        An expiration policy that removes a cached item should it have been accessed in a time amounting to more than the specified time.
    */
    LastAccessedGreaterThan(timeUnit) {
      return this.greaterThan(timeUnit, 'lastAccessed')
    },
    /*
        An expiration policy that removes a cached item should it have been accessed in a time amounting to more than the specified time.
    */
    LastAccessedGreaterThanOrEqualTo(timeUnit) {
      return this.greaterThanOrEqualTo(timeUnit, 'lastAccessed')
    },
    /*
        An expiration policy that removes a cached item should it have been accessed equal to the given time.
    */
    LastAccessedEqualTo(timeUnit) {
      return this.equalTo(timeUnit, 'lastAccessed')
    },
    /*
        An expiration policy that removes a cached item should its insertation time execeed the specified time unit.
    */
    InsertedLessThan(timeUnit) {
      return this.lessThan(timeUnit, 'insertationTime')
    },
    /*
        An expiration policy that removes a cached item should its insertation time be less than or equal to the specified time unit.
    */
    InsertedLessThanOrEqualTo(timeUnit) {
      return this.lessThanOrEqualTo(timeUnit, 'insertationTime')
    },
    /*
        An expiration policy that removes a cached item should its insertation time be greater than the specified time unit.
    */
    InsertedGreaterThan(timeUnit) {
      return this.greaterThan(timeUnit, 'insertationTime')
    },
    /*
        An expiration policy that removes a cached item should its insertation time be greater than or equal to the specified time unit.
    */
    InsertedGreaterThanOrEqualTo(timeUnit) {
      return this.greaterThanOrEqualTo(timeUnit, 'insertationTime')
    },
    /*
        An expiration policy that removes a cached item should its insertation time equal to the specified time unit.
    */
    InsertedEqualTo(timeUnit) {
      return this.equalTo(timeUnit, 'insertationTime')
    }
  }
}
