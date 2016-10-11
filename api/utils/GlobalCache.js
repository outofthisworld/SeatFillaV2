/*
    A basic cache implementation for storing global data accross services.

    Created by Dale.
*/

const cacheObj = cacheObj || {}

/*

*/
const expirationPolicies = {}

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
  if (!cacheObj || !cacheObj[this.key] || !cacheObj[this.key]['Data'] || !cacheObj[this.key]['Data'][key])
    return false

  return true
}

GlobalCache.prototype.setKey = function (key) {
  if (!(this.key in cacheObj)) {
    cacheObj[this.key] = this
  }

  const obj = cacheObj[this.key]
  delete cacheObj[this.key]

  cacheObj[key] = obj
}

GlobalCache.prototype.getData = function (key) {
  if (this.checkKeyExists(key)) {
    // Run the expiration policy on the data to make sure that the data being retrievied is 'clean'
    if (this.expirationPolicy && (typeof this.expiratioPolicy == 'function')) {
      cacheObj[this.key]['Data'][key] = this.expirationPolicy(key, cacheObj[this.key]['Data'][key])
      if ((cacheObj[this.key]['Data'][key]) == null) {
        sails.log.debug('GlobalCache: (' + this.key + '):' + ' key ' +
          key + 'has now expired and will be removed from the cache. (getData())')
        delete cacheObj[this.key]['Data'][key]
        return null
      }
    }
    sails.log.debug('GlobalCache: (' + this.key + '): returning existing result for key: ' + key)
    return cacheObj[this.key]['Data'][key].value
  } else {
    sails.log.debug('GlobalCache: (' + this.key + '): looked up not existent key ' + key)
    return null
  }
}

GlobalCache.prototype.removeData = function (key) {
  if ('Data' in cacheObj[this.key]) {
    if (key in cacheObj[this.key]['Data']) {
      delete cacheObj[this.key]['Data'][key]
      return true
    }
  } else {
    throw new Error('Invalid object state for GlobalCache in GlobalCache.js/removeData')
  }
}

GlobalCache.prototype.insertData = function (key, data) {
  if (this.ExpirationSettings.runExpirationPolicyOnInserts &&
    this.ExpirationSettings.runExpirationPolicyOnInserts())
    this.runExpirationPolicy()

  if ('Data' in cacheObj[this.key]) {
    const dataObject = {
      value: data,
      insertationTime: new Date(),
      lastAccessedTime: null,
      lastModifiedTime: null
    }
    cacheObj[this.key]['Data'][key] = dataObject
  } else {
    throw new Error('Invalid object state for GlobalCache in GlobalCache.js/insertData')
  }
}

GlobalCache.prototype.setData = function (key, data) {
  if (this.checkKeyExists(key)) {
    cacheObj[this.key]['Data'][key].lastModifiedTime = new Date()
    cacheObj[this.key]['Data'][key].value = data
  } else {
    return this.insertData(key, data)
  }
}

GlobalCache.prototype.deleteCache = function () {
  this.stopScheduledExpirationPolicy()
  this.runExpirationPolicy()
  delete cacheObj[this.key]
}

GlobalCache.prototype.setExpirationPolicy = function (obj) {
  if (typeof obj == 'function') {
    this.expirationPolicy = obj
  } else if (typeof obj == 'string') {
    if (!(obj in expirationPolicies))
      throw new Error('Invalid expiration policy passed to GlobalCache.js/setExpirationPolicy')
    this.expirationPolicy = expirationPolicies[obj]
  } else {
    throw new Error('Invalid type passed to setExpirationPolicy in GlobalCache.js')
  }
}

GlobalCache.prototype.stopScheduledExpirationPolicy = function () {
  if (!cacheObj[this.key].ScheduledTask) return

  ScheduledExecutorService.stopScheduledTask(cacheObj[this.key].ScheduledTask.clearIntervalKey)
}

GlobalCache.prototype.runExpirationPolicy = function () {
  if (!this.expirationPolicy && !(typeof this.expirationPolicy == 'function')) return

  const _self = this
  new Promise(function (resolve, reject) {
    if (cacheObj[_self.key] && 'Data' in cacheObj[_self.key]) {
      for (var key in cacheObj[_self.key]['Data']) {
        cacheObj[_self.key]['Data'][key] = _self.expirationPolicy(key, cacheObj[_self.key]['Data'][key])
        if ((cacheObj[_self.key]['Data'][key]) == null) {
          sails.log.debug('GlobalCache: (' + _self.key + '):' + ' key ' + key + 'has now expired and will be removed from the cache.')
          delete cacheObj[_self.key]['Data'][key]
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

/*
    {
        GlobalCache: 'cacheName'
        ExpirationPolicy: string || function(dataItem)
        ExpirationSettings:{
            runExpirationPolicyOnInserts:function(){
                return true
            },
            runExpirationPolicyOnDelations:function(){
                return true
            }
            ScheduledExpirationPolicyInterval:,
            ScheduledExpirationPolicyInterval
        }
    }
*/
module.exports = function (object) {
  if (!object || !object.GlobalCache) {
    throw new Error('Invalid params to exported function in GlobalCache.js. Object and Object.globalCache must exist')
  } else if (object.GlobalCache in cacheObj) {
    sails.log.debug('Retrieving global cache: ' + object.GlobalCache)
  } else {
    var cache = new GlobalCache(object)
    cacheObj[object.GlobalCache] = cache

    sails.log.debug('Creating new global cache: ' + object.GlobalCache)

    if (object.ExpirationPolicy) {
      cache.setExpirationPolicy(object.ExpirationPolicy)

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
}
