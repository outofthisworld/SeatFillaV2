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

const FileUtils = require('../utils/FileUtils')

/*
    Stores global cache implementations.
*/
const cacheObj = cacheObj || {}

function GlobalCache (object) {
  if (!object) throw new Error('Invalid object passed to GlobalCache.js GlobalCache constructor')

  const _self = this

  _self.key = object.GlobalCache
  _self.Data = object.Data || {}
}

GlobalCache.prototype.getCacheKey = function () {
  const _self = this
  return _self.key
}

GlobalCache.prototype.getDataObject = function (key) {
  const _self = this

  if (!_self.Data) throw new Error('Invalid state in GlobalCache.js/getDataObject')

  return new Promise(function (resolve, reject) {
    // Run the expiration policy on the data to make sure that the data being retrievied is 'clean'
    sails.log.debug('GlobalCache (' + _self.key + ') deleting ' + key + ' if it has expired. (getData())')

    if (_self.deleteIfExpired(key)) {
      sails.log.debug('GlobalCache: (' + _self.key + '):' + ' key ' +
        key + 'has now expired and will be removed from the cache. (getData())')

      return resolve(null)
    } else {
      _self.isSerialized(key, function (err, bool) {
        if (err) {
          sails.log.error(err)
          return reject(err);
        } else if (bool) {
          sails.log.debug('GlobalCache: (' + _self.key + '): retrieving serialized data item : ' +
            key + ' from store')
          _self.retrieveAndDeserialize(key, function (err, deserialized) {
            if (err) {
              sails.log.error(err)
              return reject(err)
            } else {
              return resolve(deserialized)
            }
          })
        }
      })

      sails.log.debug('GlobalCache: (' + _self.key + '): returning existing result for key: ' + key)
      return resolve(_self.Data[key])
    }
  })
}

GlobalCache.prototype.setDataAttribute = function (key, attr, value) {
  return _self.getDataObject(key).then(function (exists) {
    if (exists) {
      exists[attr] = value
      return Promise.resolve(true)
    } else {
      return Promise.resolve(false)
    }
  })
}

GlobalCache.prototype.getDataAttribute = function (key, attr) {
  return _self.getDataObject(key).then(function (exists) {
    return Promise.resolve(exists[attr])
  })
}

GlobalCache.prototype.setLastAccessed = function (key, date) {
  const _self = this
  return _self.setDataAttribute(key, 'lastAccessed', date)
}

GlobalCache.prototype.getLastAccessed = function (key) {
  const _self = this
  return _self.getDataAttribute(key, 'lastAccessed')
}

GlobalCache.prototype.getLastModified = function (key) {
  const _self = this
  return _self.getDataAttribute(key, 'lastModified')
}

GlobalCache.prototype.setLastModified = function (key, date) {
  const _self = this
  return _self.setDataAttribute(key, 'lastModified', date)
}

GlobalCache.prototype.getInsertationTime = function (key) {
  const _self = this
  return _self.getDataAttribute(key, 'insertationTime')
}

GlobalCache.prototype.setInsertationTime = function (key, date) {
  const _self = this
  return _self.setDataAttribute(key, 'insertationTime', date)
}

GlobalCache.prototype.getData = function (key) {
  const _self = this
  _self.getDataObject(key).then(function (data) {
    if (data != null && 'value' in data)
      return Promise.resolve(data.value)
    else
      return Promise.resolve(data)
  })
}

GlobalCache.prototype.removeData = function (key) {
  const _self = this

  if (key in _self.Data) {
    if (_self.ExpirationSettings.runExpirationPolicyOnDeletions &&
      typeof _self.ExpirationSettings.runExpirationPolicyOnDeletions == 'function' &&
      _self.ExpirationSettings.runExpirationPolicyOnDeletions())
      _self.runExpirationPolicy()

    // Add support for removing serialized items

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

  if ('Data' in _self) {
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

  if (key in _self.Data) {
    _self.Data[key].lastModifiedTime = new Date()
    // Make sure we dont override the changed data later..
    delete _self.Data[key].isSerialized
    _self.Data[key].value = data
  } else {
    return _self.insertData(key, data)
  }
}

module.exports = {
  cache(object) {
    if (!object) {
      throw new Error('Invalid params to exported function in GlobalCache.js.')
    } else if (!object.GlobalCache) {
      throw new Error('Invalid params to exported function in GlobalCache.js. Object.globalCache || Object.CacheSettings must exist')
    }

    sails.log.debug('Creating new global cache: ' + object.GlobalCache)

    const cache = (cacheObj[object.GlobalCache] || new GlobalCache(object))
    cache.__proto__ = this._proto
    cache.GlobalCache = cache.GlobalCache || object.GlobalCache
    cache.expirationPolicies = (Array.isArray(object.ExpirationPolicies) &&
    object.ExpirationPolicies) || cache.expirationPolicies || []
    cache.secondaryStoragePolicies = (Array.isArray(object.SecondaryStoragePolicies) &&
    object.SecondaryStoragePolicies) || cache.secondaryStoragePolicies || []
    cache.scheduledTimes = {}
    cache.scheduledTimes.scheduledPolicyInterval = object.ScheduledPolicyInterval || null
    cache.scheduledTimes.scheduledPolicyInitialDelay = object.ScheduledPolicyIntialDelay || null
    cache.secondaryStorageSettings = { useSecondaryStorage: object.UseSecondaryStorage || true }

    if (object.SecondaryStorageSettings) {
      cache.serialize = object.SecondaryStorageSettings.serialize ||
      cache.serialize

      cache.deserialize = object.SecondaryStorageSettings.deserialize ||
      cache.deserialize

      cache.retrieve = object.SecondaryStorageSettings.retrieve ||
      cache.retrieve

      cache.store = object.SecondaryStorageSettings.store ||
      cache.store
    }

    cache.trySchedule()
    cacheObj[object.GlobalCache] = cache
    return cache
  },
  _proto: {
    /*
    Turn the cached data into a format ready for storage in a DB/Filesystem
    */
    serialize(key, dataItem, callback) {
      try {
        return callback(null, JSON.stringify(dataItem))
      } catch (err) {
        callback(err, null)
      }
    },

    /*
        Turn serialized data back into a format for memory.
    */
    deserialize(data, callback) {
      FileUtils.safeParseJsonAsync(data).then(function (obj) {
        return callback(null, obj)
      }).catch(function (err) {
        return callbac(err, null)
      })
    },

    /*
        Store the item in some way, away from process memory
    */
    store(key, dataItem, callback) {
      const _self = this

      FileUtils.createTempDirAndWrite(_self.key, 'GlobalCacheItem-' + key, dataItem)
        .then(function (dirInfo) {
          callback(null)
        }).catch(function (err) {
        callbac(err)
      })

      return true
    },

    /*
        Retrieve data from its storage location.
    */
    retrieve(key, callback) {
      const _self = this

      FileUtils.readFromTempDir(_self.key, 'GlobalCacheItem-' + key).then(function (data) {
        callback(null, data)
      }).catch(function (err) {
        callback(err, null)
      })
    },
    retrieveAndDeserialize(key, callback) {
      _self.retrieve(key, function (err, data) {
        if (err) {
          sails.log.error(err)
          return callback(err, null)
        } else {
          _self.deserialize(data, function (err, deserialized) {
            delete _self.Data[key].isSerialized
            _self.Data[key].value = deserialized
            _self.setLastAccessed(key, new Date())
            return callback(null, _self.Data[key])
          })
        }
      })
    },
    isSerialized(key, callback) {
      _self.getDataObject(key).then(function (data) {
        if (data && 'isSerialized' in data) {
          callback(null, true)
        } else {
          callback(null, false)
        }
      }).catch(function (err) {
        sails.log.error(err)
        callback(err, null)
      })
    },
    runExpirationPolicy() {
      const _self = this

      if (!_self.expirationPolicies && !_self.secondaryStoragePolicies) return

      return new Promise(function (resolve, reject) {
        if ('Data' in _self) {
          for (var key in _self['Data']) {
            if (_self['Data'].hasOwnProperty(key)) {
              const wasDeleted = false

              if (_self.deleteIfExpired(key)) {
                sails.log.debug('GlobalCache: (' + _self.key + '):' + ' key: ' +
                  key + 'has now expired and will be removed from the cache.')
                wasDeleted = true

                if (_self.refreshPolicy && typeof _self.refreshPolicy === 'function') {
                  _self.setData(key, _self.refreshPolicy(key))
                  if (_self['Data'][key] != null) {
                    wasDeleted = false
                  }
                }
              }

              // pass to storagePolicies size of cache, total free memory, sizeOfDataItemm
              if (!wasDeleted && _self.shouldMoveToSecondaryStorage(key) && 'value' in _self.Data[key]) {
                try {
                  _self.serialize(key, _self.Data[key].value, function serializeCalled (err, data) {
                    if (err || !data) {
                      sails.log.debug('GlobalCache: (' + _self.key + '): error when serializing data with key ' + key + ' data was ' + _self['Data'][key])
                      sails.log.error(err)
                      return reject(err)
                    } else {
                      _self.store(key, data,
                        function storeCalled (err) {
                          if (err) {
                            sails.log.debug('Error when storing item with key ' + key + ' in global cache ' + _self.key)
                            sails.log.error(err)
                            return reject(err)
                          } else {
                            // Handle stored item, delete it from memory or whatever
                            _self.Data[key].value = null
                            _self.Data[key].isSerialized = true
                          }
                        })
                    }
                  })
                } catch (err) {
                  sails.log.error(err)
                  sails.log.debug('Error when trying to store/serialize object in GlobalCache ( ' + _self.key + '), key was ' + key + ' data was ' + _self.Data[key])
                  return reject(err)
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
    },
    checkExpired(key) {
      const _self = this
      return _self.checkPolicies('expirationPolicies', key)
    },
    deleteIfExpired(key) {
      const _self = this

      if (_self.checkExpired(key)) {
        delete _self.Data[key]
        return true
      } else {
        sails.log.debug('GlobalCache (' + _self.key + '): ' + key + ' has not expired')
        return false
      }
    },
    checkPolicies(attr, key) {
      const _self = this

      if (!_self[attr] || !Array.isArray(_self[attr]) || !(key in _self.Data) ||
        !_self.secondaryStorageSettings.useSecondaryStorage) return false

      for (var i = 0; i < _self[attr].length; i++) {
        if (_self.checkPolicy(self[attr][i], _self.Data[key])) {
          return true
        }
      }
      return false
    },
    checkPolicy(policy, dataItem) {
      if (typeof policy == 'function' && policy(dataItem)) {
        return true
      } else {
        return false
      }
    },
    shouldMoveToSecondaryStorage(key) {
      const _self = this
      return _self.checkPolicies('secondaryStoragePolicies', key)
    },
    deleteCache() {
      const _self = this

      _self.stopScheduledExpirationPolicy()
      _self.runExpirationPolicy()
      delete cacheObj[_self.key]
    },

    setPolicies(attr, obj) {
      const _self = this

      sails.log.debug('GlobalCache (' + _self.key + ') setting ' + attr + ' to ' + obj + ' ' + Array.isArray(obj))

      if (!Array.isArray(obj))
        throw new Error('Invalid object passed to GlobalCache.js/setPolicies, must be an array')

      if (attr in _self && !Array.isArray(_self[attr]))
        throw new Error('Invalid attribute specified for setPolicies in GlobalCache.js/setPolicies')

      if (!this[attr])
        this[attr] = []

      obj.forEach(function (expiriationPolicy) {
        _self.setPolicy(attr, expiriationPolicy)
      })
    },

    setPolicy(attr, policy) {
      if (!(typeof policy == 'function')) {
        sails.log.debug('Found policy with ' + typeof policy)
        throw new Error('Invalid state in GlobalCache.js/setPolicy')
      }

      if (Array.isArray(this[attr])) {
        this[attr].push(policy)
      } else {
        this[attr] = policy
      }
    },

    setExpirationPolicies(obj) {
      this.setPolicies('expirationPolicies', obj)
    },

    getSecondaryStoragePolicies() {
      return this.secondaryStoragePolicies
    },
    getExpirationPolicies() {
      return this.expirationPolicies
    },

    setSecondaryStoragePolicies(obj) {
      this.setPolicies('secondaryStoragePolicies', obj)
    },

    setRefreshPolicy(refreshPolicy) {
      const _self = this
      _self.setPolicy('refreshPolicy', refreshPolicy)
    },

    getRefreshPolicy() {
      return this.refreshPolicy
    },

    stopScheduledExpirationPolicy() {
      const _self = this

      if (!_self.ScheduledTask) return

      ScheduledExecutorService.stopScheduledTask(cacheObj[_self.key].ScheduledTask.clearIntervalKey)
      delete _self.ScheduledTask
    },
    trySchedule() {
      const self = this

      if (!self.ScheduledTask && (self.scheduledTimes.scheduledPolicyInterval || self.scheduledTimes.scheduledPolicyInitialDelay)) {
        const interval = self.scheduledTimes.scheduledPolicyInterval ?
          self.scheduledTimes.scheduledPolicyInterval.toMilliseconds() : 0

        const delay = self.scheduledTimes.scheduledPolicyInitialDelay ?
          self.scheduledTimes.scheduledPolicyInitialDelay.toMilliseconds() : 0

        const scheduledTask = ScheduledExecutorService.execute({
          key: self.GlobalCache + '-GlobalCache',
          on: {
            executionBegan(date) {
              sails.log.debug('Running expiration policy for cache ' +
                self.GlobalCache + ' on ' + date)
            },
            executionFinished(date, output) {
              sails.log.debug('Finished running expiration policy for cache ' +
                self.GlobalCache + ' on ' + date)
            },
            error(date, error) {
              sails.log.debug('Error running expiration policy for cache ' +
                self.GlobalCache + ' on ' + date)
            },
            stop(date) {
              sails.log.debug('Stopped scheduled task of global cache ' +
                self.GlobalCache)
            }
          },
          work() {
            self.runExpirationPolicy().catch(function (err) {
              sails.log.debug('Error when running global cache ' +
                self.GlobalCache + ' expiration policy ')
              sails.log.error(err)
            })
          },
          maxExecutions: 0
        }, interval, delay)

        sails.log.debug('Succesfully scheduled ' + self.GlobalCache + ' expiration policy to run every ' +
          ((interval.getValue && interval.getValue()) || 0) + ' ms with an initial delay of ' + ((delay.getValue())) + ' ms ')

        self.ScheduledTask = scheduledTask
      } else {
        sails.log.debug('Did not schedule global cache: ' + self.GlobalCache + ' was this intended? ')
      }
    }
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
