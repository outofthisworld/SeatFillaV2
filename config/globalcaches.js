/*
    This module contains any caches that will be used server side to reduce response times
    to external services and reduce repeated requests for the same information.

    For example, an external request is needed by the Seatfilla website to retrieve the latest foreign exchange rates
    so that data can be displayed to the user in their requested currency. However this data is usually only updated
    every hour before final prices are finalized at the end of the day. By creating a cache for this information 
    we can reduce the response times to the user by 1-2 seconds. Each cache can have its own expiration policy, or many, which
    determine when the data will either be removed from the cache, or refreshed so that the data is current.

    Created by Dale.
*/

const GlobalCache = require('../api/utils/GlobalCache')

const timeUtils = require('../api/utils/TimeUtils')
const hasInitialized = false

function init () {
  if (hasInitialized) return

  /*
    This is here until I have enough time to add memory usage expiration policies to the global cache
    and create a digital storage utils class for conversions.
  */
  function tempMemoryUsageExpirationPolicy (dataItem, cache) {
    const shouldRemove =  GlobalCache.ExpirationPolicies.lastAccessedGreaterThan(timeUtils.createTimeUnit(30).Minutes)(dataItem) &&
      (process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) < 1024 * 1024 * 200 // 200MB
    
    if(shouldRemove){
        sails.log.debug('Removing cached item ' + dataItem + ' from global cache: ' + key + ' due to memory constraints ');
        return true;
    }else{
        return false;
    }
  }

  /*
      A cache containing data from the fixer io exchange rates service.
  */
  GlobalCache.cache({
    GlobalCache: 'fixer_io_exchange_rates',
    ExpirationPolicies: [
      GlobalCache.ExpirationPolicies.insertedGreaterThanOrEqualTo(timeUtils.createTimeUnit(1).Hours),
      tempMemoryUsageExpirationPolicy
    ],
    ExpirationSettings: {
      runExpirationPolicyOnInserts: function () { return true; },
      runExpirationPolicyOnDeletions: function () { return true; },
      ScheduledExpirationPolicyInterval: timeUtils.createTimeUnit(1).Hours,
      ScheduledExpirationIntialDelay: timeUtils.createTimeUnit(1).Hours
    },
    SecondaryStoragePolicies: [

    ],
    SecondaryStorageSettings:{

    }
  })

  /*
      A cache containing data from the rest countries endpoint.
  */
  GlobalCache.cache({
    GlobalCache: 'rest_countries_cache',
    ExpirationPolicies: [
      GlobalCache.ExpirationPolicies.lastAccessedGreaterThanOrEqualTo(timeUtils.createTimeUnit(12).Hours),
      tempMemoryUsageExpirationPolicy
    ],
    ExpirationSettings: {
      runExpirationPolicyOnInserts: function () { return true; },
      runExpirationPolicyOnDeletions: function () { return true; },
      ScheduledExpirationPolicyInterval: timeUtils.createTimeUnit(6).Hours,
      // Run the expiration policy with an initial delay of 4 hours.
      ScheduledExpirationIntialDelay: timeUtils.createTimeUnit(6).Hours
    }
  })

  GlobalCache.cache({
    GlobalCache: 'getty_images_cache',
    ExpirationPolicies: [
      GlobalCache.ExpirationPolicies.insertedGreaterThanOrEqualTo(timeUtils.createTimeUnit(12).Hours),
      tempMemoryUsageExpirationPolicy
    ],
    ExpirationSettings: {
      runExpirationPolicyOnInserts: function () { return true; },
      runExpirationPolicyOnDeletions: function () { return true; },
      // Run the expiration polcy every 4 hours.
      ScheduledExpirationPolicyInterval: timeUtils.createTimeUnit(4).Hours,
      // Run the expiration policy with an initial delay of 4 hours.
      ScheduledExpirationIntialDelay: timeUtils.createTimeUnit(4).Hours
    }
  })

  hasInitialized = true
}

module.exports.globalcaches = init
