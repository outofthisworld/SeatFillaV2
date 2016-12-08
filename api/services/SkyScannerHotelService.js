// Request module for sending and recieving API requests
const request = require('request')
// Used to encode form data
const querystring = require('querystring')

// Making requests to SS.
const apiKey = sails.config.skyscanner.apiKey

const hotelSortColumns = {
  Rating: 'rating',
  Name: 'name',
  Category: 'category',
  Location: 'location',
  Distance: 'distance',
  Price: 'price',
  Relevance: 'relevance'
}

const hotelSortOrders = {
  ASC: 'asc',
  DESC: 'desc'
}

const baseUrl = 'http://partners.api.skyscanner.net'
const skyScannerUrlEndpoint = baseUrl + '/apiservices/hotels/liveprices/v2/'

module.exports = {
  getHotelSortColumns: function () {
    return Object.create(hotelSortColumns)
  },
  getHotelSortOrders: function () {
    return Object.create(hotelSortOrders)
  },
  createPriceFilterString: function (min, max) {
    return min + '-' + max
  },
  createSession(obj) {
    return new Promise(function (resolve, reject) {
      if (!obj) return reject(new Error('Invalid params supplied to createSession in SkyScannerHotelService.js'))

      const pathString = _.values(obj).join('/')
      sails.log.debug('Path string : ' + pathString)
      const finalPath = skyScannerUrlEndpoint + (pathString || '') + '?apiKey=prtl6749387986743898559646983194'
      sails.log.debug('Final path' + finalPath)
      const _this = this

      request({
        headers: {
          'Accept': 'application/json'
        },
        uri: finalPath,
        method: 'GET'
      }, function (err, res, body) {
        if (err) return reject({
            error: err
          })
        try {
          const result = JSON.parse(res.body)

          if (result.ValidationErrors) {
            sails.log.error(new Error(result.ValidationErrors[0]))
            sails.log.error(result.errors)
            return reject({
              error: result.ValidationErrors
            })
          } else if (result.errors) {
            sails.log.error(result.errors)
            return reject({
              error: result.errors
            })
          } else if (res.statusCode != 200) {
            const error = new Error('Invalid response code when creating new session in SkyScannerHotelServer.js: response was: ' + res.statusCode)
            sails.log.error(error)
            return reject({
            error})
          }

          sails.log.debug('Next poll url: ' + res.headers.location)
          sails.log.debug('Hotel session body: ' + res.body)
          sails.log.debug('Response headers from requesting hotel session were ' + JSON.stringify(res.headers))
          return resolve({
            body: result,
            nextPollUrl: res.headers.location
          })
        } catch (err) {
          sails.log.error(err)
          return reject({
            error: err
          })
        }
      })
    })
  },
  requestHotelDetails(urlEndPoint, obj) {
    return new Promise((resolve, reject) => {

      if (!urlEndPoint)
        return Promise.reject(new Error('Invalid params to request hotel details, urlEndPoint was ' + urlEndPoint))

      sails.log.debug('Url endpoint to poll was ' + urlEndPoint)

      // Encode the obj as a query string..
      const queryString = querystring.stringify(obj)
      const finalPath = baseUrl + urlEndPoint + '&' + (queryString || '')

      sails.log.debug('Polling: ' + finalPath)

      const _this = this

      request({
        headers: {
          'Accept': 'application/json'
        },
        uri: finalPath,
        method: 'GET'
      }, function (err, res, body) {
        if (err) {
          return reject({
            error: err
          })
        } else {
          try {
            const result = JSON.parse(body)

            if (result.ValidationErrors) {
              sails.log.error(new Error(result.ValidationErrors[0]))
              return reject(result.ValidationErrors[0])
            } else if (res.statusCode != 200) {
              const error = new Error('Invalid response code when creating new session in SkyScannerHotelServer.js: response was: ' + res.statusCode)
              sails.log.error(error)
              return reject(error)
            } else {
              return resolve({
                body: result,
                nextPollUrl: res.headers.Location || urlEndPoint
              })
            }
          } catch (err) {
            sails.log.error(err)
            return reject(err)
          }
        }
      })
    })
  },
  createHotelDetails(urlEndPoint, hotelIds) {
    return new Promise((resolve, reject) => {

      if (!urlEndPoint) {
        urlEndPoint = 'http://partners.api.skyscanner.net/apiservices/hotels/livedetails/v2/details?apikey=' + apiKey
      }

      if (!Array.isArray(hotelIds))
        return Promise.reject(new Error('Invalid params to create hotel details, hotels ids were: ' + hotelIds))

      sails.log.debug('Url endpoint to poll was ' + urlEndPoint)

      const finalPath = (urlEndPoint.startsWith('http://') ? '' : baseUrl) + urlEndPoint + '&hotelIds=' + hotelIds.join(',')

      sails.log.debug('Polling: ' + finalPath)

      const _this = this

      request({
        headers: {
          'Accept': 'application/json'
        },
        uri: finalPath,
        method: 'GET'
      }, function (err, res, body) {
        if (err) return reject(err)

        try {
          const result = JSON.parse(body)

          if (result.ValidationErrors) {
            sails.log.error(new Error(result.ValidationErrors[0]))
            return reject({
              error: result.ValidationErrors
            })
          } else if (res.statusCode != 200) {
            const error = new Error('Invalid response code when creating new session in SkyScannerHotelServer.js: response was: ' + res.statusCode)
            sails.log.error(error)
            return reject({
            error})
          } else {
            return resolve({
              body: result,
              nextPollUrl: res.headers.Location || urlEndPoint
            })
          }
        } catch (err) {
          sails.log.error(err)
          return reject(err)
        }
      })
    })
  },
  pollHotelDetails(detailsUrl, ids, callback) {
    const _this = this
    var calledBack = false
    _this.createHotelDetails(detailsUrl,
      ids).then(function (result) {
      if (result.body.status == 'COMPLETE' && !calledBack) {
        calledBack = !calledBack
        return callback(null, result)
      } else {
        _this.pollHotelDetails(result.nextPollUrl)
      }
    }).catch(callback)
  },
  getDefaultSessionObject() {
    return {
      market: '',
      currency: '',
      locale: '',
      entityId: '',
      checkindate: new Date().toISOString(),
      checkoutdate: '',
      guests: 1,
      rooms: 1
    }
  },
  getDefaultHotelRequestObject() {
    return {
      pageSize: 10,
      pageIndex: 0,
      imageLimit: 50,
      sortOrder: hotelSortOrders.ASC,
      sortColumn: hotelSortColumns.Rating
    }
  },
  getDefaultHotelDetailsObject() {
    return {
      hotelIds: []
    }
  }
}
