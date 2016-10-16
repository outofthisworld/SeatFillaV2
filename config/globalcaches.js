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
const memoryUtils = require('../api/utils/MemoryConversionUtils')
const hasInitialized = false

function init () {
  if (hasInitialized) return

  /*
      A cache containing data from the fixer io exchange rates service.
  */
  GlobalCache.cache({
    GlobalCache: 'fixer_io_exchange_rates',
    ExpirationPolicies: [
      // Remove from the cache if the item ages more than one hour.
      GlobalCache.DataItemPolicies.insertedGreaterThanOrEqualTo(
        timeUtils.createTimeUnit(1).Hours)
    ],
    ExpirationSettings: {
      runExpirationPolicyOnInserts: function () {
        return true
      },
      runExpirationPolicyOnDeletions: function () {
        return true
      }
    },
    SecondaryStoragePolicies: [
      // Move to secondary storage if the item exceeds 2MB.
      GlobalCache.DataItemPolicies.sizeOfCachedItemGreaterThanOrEqualTo(
        memoryUtils.createMemoryUnit(2).Megabytes)
    ],
    SerializationPolicies: [
      // Cache will be completely serialized if it execeeds 15 megabytes
      GlobalCache.SerializationPolicies.sizeOfCacheGreaterThan(
        memoryUtils.createMemoryUnit(15).Megabytes, 'fixer_io_exchange_rates')
    ],
    SecondaryStorageSettings: {
      UseSecondaryStorage: true
    },
    // Run job once an hour.
    ScheduledPolicyInterval: timeUtils.createTimeUnit(1).Minutes,
    ScheduledPolicyIntialDelay: timeUtils.createTimeUnit(1).Minutes
  })

  /*
      A cache containing data from the rest countries endpoint.
  */
  GlobalCache.cache({
    GlobalCache: 'rest_countries_cache',
    ExpirationPolicies: [
      GlobalCache.DataItemPolicies.lastAccessedGreaterThanOrEqualTo(timeUtils.createTimeUnit(12).Hours)
    ],
    ExpirationSettings: {
      runExpirationPolicyOnInserts: function () { return true; },
      runExpirationPolicyOnDeletions: function () { return true; }
    },
    SecondaryStoragePolicies: [
      GlobalCache.DataItemPolicies.sizeOfCachedItemGreaterThanOrEqualTo(
        memoryUtils.createMemoryUnit(500).Killobytes)
    ],
    SerializationPolicies: [
      GlobalCache.SerializationPolicies.sizeOfCacheGreaterThan(
        memoryUtils.createMemoryUnit(10).Megabytes, 'rest_countries_cache')
    ],
    SecondaryStorageSettings: {
      UseSecondaryStorage: true
    },
    ScheduledPolicyInterval: timeUtils.createTimeUnit(6).Hours,
    // Run the expiration policy with an initial delay of 6 hours.
    ScheduledPolicyIntialDelay: timeUtils.createTimeUnit(6).Hours
  })

  GlobalCache.cache({
    GlobalCache: 'getty_images_cache',
    ExpirationPolicies: [
      GlobalCache.DataItemPolicies.insertedGreaterThanOrEqualTo(timeUtils.createTimeUnit(12).Hours)
    ],
    ExpirationSettings: {
      runExpirationPolicyOnInserts: function () { return true; },
      runExpirationPolicyOnDeletions: function () { return true; }
    },
    SecondaryStoragePolicies: [
      GlobalCache.DataItemPolicies.sizeOfCachedItemGreaterThanOrEqualTo(
        memoryUtils.createMemoryUnit(500).Killobytes)
    ],
    SerializationPolicies: [
      GlobalCache.SerializationPolicies.sizeOfCacheGreaterThan(
        memoryUtils.createMemoryUnit(20).Megabytes, 'getty_images_cache')
    ],
    SecondaryStorageSettings: {
      UseSecondaryStorage: true
    },
    // Run the expiration polcy every 4 hours.
    ScheduledPolicyInterval: timeUtils.createTimeUnit(4).Hours,
    // Run the expiration policy with an initial delay of 4 hours.
    ScheduledPolicyIntialDelay: timeUtils.createTimeUnit(4).Hours
  })

  hasInitialized = true
}

module.exports.globalcaches = init
