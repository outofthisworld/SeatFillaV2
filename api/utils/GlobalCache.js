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

function GlobalCache(options) {
    if (!options) throw new Error('Invalid object passed to GlobalCache.js GlobalCache constructor')

    const _self = this

    _self.key = options.GlobalCache
    _self.ExpirationSettings = options.ExpirationSettings || {}
    _self.Data = options.Data || {}
    _self.UseSecondaryStorage = options.UseSecondaryStorage || true
}

GlobalCache.prototype.getCacheKey = function() {
    const _self = this
    return _self.key
}

GlobalCache.prototype.getDataObject = function(key) {
    const _self = this
    if (!_self.Data) throw new Error('Invalid state in GlobalCache.js/getDataObject')
    else return _self.Data[key]
}

GlobalCache.prototype.setDataAttribute = function(key, attr, value) {
    const exists = _self.getDataObject(key);

    if (exists) {
        exists[attr] = value;
    } else {
        return false;
    }
}

GlobalCache.prototype.getDataAttribute = function(key, attr) {
    const exists = _self.getDataObject(key);

    if (exists && attr in exists) return exists[attr];
    else return null;
}

GlobalCache.prototype.setLastAccessed = function(key, date) {
    const _self = this

    _self.setDataAttribute(key, 'lastAccessed', date);
}

GlobalCache.prototype.getLastAccessed = function(key) {
    const _self = this
    return _self.getDataAttribute(key, 'lastAccessed');
}

GlobalCache.prototype.getLastModified = function(key) {
    const _self = this
    return _self.getDataAttribute(key, 'lastModified');
}

GlobalCache.prototype.setLastModified = function(key, date) {
    const _self = this
    return _self.setDataAttribute(key, 'lastModified', date);
}

GlobalCache.prototype.getInsertationTime = function(key) {
    const _self = this
    return _self.getDataAttribute(key, 'insertationTime');
}

GlobalCache.prototype.setInsertationTime = function(key, date) {
    const _self = this
    return _self.setDataAttribute(key, 'insertationTime', date);
}

GlobalCache.prototype.getData = function(key) {
    const _self = this

    new Promise(function(resolve, reject) {
        // Run the expiration policy on the data to make sure that the data being retrievied is 'clean'
        sails.log.debug('GlobalCache (' + _self.key + ') deleting ' + key + ' if it has expired. (getData())')

        if (_self.deleteIfExpired(key)) {
            sails.log.debug('GlobalCache: (' + _self.key + '):' + ' key ' +
                key + 'has now expired and will be removed from the cache. (getData())')
            return resolve(null)
        } else {
            sails.log.debug('GlobalCache: (' + _self.key + '): returning existing result for key: ' + key)

            const exists = _self.getDataObject(key)

            if (!exists) return resolve(null)

            if ('isSerialized' in exists) {
                sails.log.debug('GlobalCache: (' + _self.key + '): deserializing ' + key + ' from secondary storage')

                _self.retrieve(key, function(err, data) {
                    if (err) {
                        sails.log.error(err)
                        reject(err)
                    } else {
                        _self.deserialize(data, function(err, deserialized) {
                            delete exists.isSerialized
                            exists.value = deserialized
                            _self.setLastAccessed(key, new Date())
                            return resolve(exists)
                        })
                    }
                })
            }
        }
    })
}

GlobalCache.prototype.removeData = function(key) {
    const _self = this

    if (_self.checkDataKeyExists(key)) {
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

GlobalCache.prototype.insertData = function(key, data) {
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

GlobalCache.prototype.setData = function(key, data) {
    const _self = this

    if (_self.checkDataKeyExists(key)) {
        _self.Data[key].lastModifiedTime = new Date()
        _self.Data[key].value = data
    } else {
        return _self.insertData(key, data)
    }
}

GlobalCache.prototype.checkExpired = function(key) {
    const _self = this
    return _self.checkPolicies('expirationPolicies', key);
}

GlobalCache.prototype.deleteIfExpired = function(key) {
    const _self = this

    if (_self.checkExpired(key)) {
        delete _self.Data[key]
        return true
    } else {
        sails.log.debug('GlobalCache (' + _self.key + '): ' + key + ' has not expired')
        return false
    }
}

GlobalCache.prototype.checkPolicies = function(attr, key) {
    const _self = this;

    if (!_self[attr] || !Array.isArray(_self[attr]) || !_self.checkDataKeyExists(key) || !_self.UseSecondaryStorage) return false

    for (key in _self[attr]) {
        if (_self.checkPolicy(self[attr][key], _self.Data[key])) {
            return true;
        }
    }
    return false
}

GlobalCache.prototype.checkPolicy = function(policy, dataItem) {
    if (typeof policy == 'function' && policy(dataItem)) {
        return true
    } else {
        return false;
    }
}

GlobalCache.prototype.shouldMoveToSecondaryStorage = function(key) {
    const _self = this;
    return _self.checkPolicies('secondaryStoragePolicies', key);
}

GlobalCache.prototype.deleteCache = function() {
    const _self = this

    _self.stopScheduledExpirationPolicy()
    _self.runExpirationPolicy()
    delete cacheObj[_self.key]
}

GlobalCache.prototype.setPolicies = function(attr, obj) {
    const _self = this

    if (!Array.isArray(obj))
        throw new Error('Invalid object passed to GlobalCache.js/setPolicies, must be an array')

    if (attr in _self && !Array.isArray(_self[attr]))
        throw new Error('Invalid attribute specified for setPolicies in GlobalCache.js/setPolicies');

    if (!this[attr])
        this[attr] = [];

    obj.forEach(function(expiriationPolicy) {
        _self.setPolicy(expiriationPolicy);
    })
}

GlobalCache.prototype.setPolicy = function(attr, policy) {
    if (!(typeof policy == 'function'))
        throw new Error('Invalid state in GlobalCache.js/setPolicy');

    if (Array.isArray(this[attr])) {
        this[attr].push(policy);
    } else {
        this[attr] = policy;
    }
}

GlobalCache.prototype.setExpirationPolicies = function(obj) {
    this.setPolicies('expirationPolicies', obj);
}

GlobalCache.prototype.getSecondaryStoragePolicies = function() {
    return this.secondaryStoragePolicies;
}

GlobalCache.prototype.getExpirationPolicies = function() {
    return this.expirationPolicies;
}

GlobalCache.prototype.setSecondaryStoragePolicies = function(obj) {
    this.setPolicies('secondaryStoragePolicies', obj);
}

GlobalCache.prototype.setRefreshPolicy = function(refreshPolicy) {
    const _self = this
    _self.setPolicy('refreshPolicy', refreshPolicy);
}

GlobalCache.prototype.getRefreshPolicy = function() {
    return this.refreshPolicy;
}

GlobalCache.prototype.stopScheduledExpirationPolicy = function() {
    const _self = this

    if (!_self.ScheduledTask) return

    ScheduledExecutorService.stopScheduledTask(cacheObj[_self.key].ScheduledTask.clearIntervalKey)
}

GlobalCache.prototype.runExpirationPolicy = function() {
    const _self = this

    if (!_self.expirationPolicies && !_self.secondaryStoragePolicies) return

    new Promise(function(resolve, reject) {
        if ('Data' in _self) {
            for (var key in _self['Data']) {
                if (_self['Data'].hasOwnProperty(key)) {
                    const wasDeleted = false

                    if (_self.deleteIfExpired(key)) {
                        sails.log.debug('GlobalCache: (' + _self.key + '):' + ' key: ' +
                            key + 'has now expired and will be removed from the cache.')
                        wasDeleted = true

                        if (_self.refreshPolicy && typeof _self.refreshPolicy === 'function') {
                            _self.setData(key, _self.refreshPolicy(key));
                            if (_self['Data'][key] != null) {
                                wasDeleted = false
                            }
                        }
                    }

                    // pass to storagePolicies size of cache, total free memory, sizeOfDataItemm
                    if (!wasDeleted && _self.shouldMoveToSecondaryStorage(key) && 'value' in _self.Data[key]) {
                        try {
                            _self.serialize(key, _self.Data[key].value, function serializeCalled(err, data) {
                                if (err || !data) {
                                    sails.log.debug('GlobalCache: (' + _self.key + '): error when serializing data with key ' + key + ' data was ' + _self['Data'][key])
                                    sails.log.error(err)
                                } else {
                                    _self.store(key, data,
                                        function storeCalled(err) {
                                            if (err) {
                                                sails.log.debug('Error when storing item with key ' + key + ' in global cache ' + _self.key)
                                                sails.log.error(err)
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
                        }
                    }
                }
            }
            resolve(true)
        } else {
            reject(new Error('Invalid state for cache ' + _self.key + ' in GlobalCache.js/runExpirationPolicy'))
        }
    }).catch(function(err) {
        sails.log.error(err)
    })
}

/*
    Turn the cached data into a format ready for storage in a DB/Filesystem
*/
GlobalCache.prototype.serialize = function(key, dataItem, callback) {
    try {
        return callback(null, JSON.stringify(dataItem))
    } catch (err) {
        callback(err, null)
    }
}

/*
    Turn serialized data back into a format for memory.
*/
GlobalCache.prototype.deserialize = function(data, callback) {
    FileUtils.safeParseJsonAsync(data).then(function(obj) {
        return callback(null, obj)
    }).catch(function(err) {
        return callbac(err, null)
    })
}

/*
    Store the item in some way, away from process memory
*/
GlobalCache.prototype.store = function(key, dataItem, callback) {
    const _self = this

    FileUtils.createTempDirAndWrite(_self.key, 'GlobalCacheItem-' + key, dataItem)
        .then(function(dirInfo) {
            callback(null)
        }).catch(function(err) {
            callbac(err)
        })

    return true
}

/*
    Retrieve data from its storage location.
*/
GlobalCache.prototype.retrieve = function(key, callback) {
    const _self = this

    FileUtils.readFromTempDir(_self.key, 'GlobalCacheItem-' + key).then(function(data) {
        callback(null, data)
    }).catch(function(err) {
        callback(err, null)
    })
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
                cache
            }

            if (object.ExpirationPolicies) {
                cache.setExpirationPolicies(object.ExpirationPolicies)
                cache.set
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
            return function(dataItem) {
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
            return function(dataItem, dataItemAttribute) {
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
            return function(dataItem) {
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
            return function(dataItem) {
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
            return function(dataItem, dataItemAttribute) {
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