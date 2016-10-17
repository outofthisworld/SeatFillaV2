/*
    This module contains the logic for integrating with skyscanners public flight API.
    Created by Dale.
    
    Methods are heavily documented with information obtained about skyscanners API,
    to enable quick modifications/ability to recognize API changes.
*/

// Request module for sending and recieving API requests
const request = require('request')
// Used to encode form data
const querystring = require('querystring')
// Error utils for more details errors
const ErrorUtils = require('./../utils').ErrorUtils
// Making requests to SS.
const apiKey = sails.config.skyscanner.apiKey
// The end point location
const skyScannerApiEndPoint = 'http://partners.api.skyscanner.net/apiservices/pricing/v1.0'

const exportObj = {
  // Location schema
  locationschemas: {
    Iata: 'Iata',
    GeoNameCode: 'GeoNameCode',
    GeoNameId: 'GeoNameId',
    Rnid: 'Rnid',
    Sky: 'Sky'
  },
  // Cabin classes
  cabinclasses: {
    Economy: 'Economy',
    PremiumEconomy: 'PremiumEconomy',
    Business: 'Business',
    First: 'First'
  },
  // The carrier schemas
  carrierschemas: {
    Iata: 'Iata',
    Icao: 'Icao',
    Skyscanner: 'Skyscanner'
  },
  // Sort itin by...
  sorttypes: {
    carrier: 'carrier',
    duration: 'duration',
    outboundarrivetime: 'outboundarrivetime',
    outbounddeparttime: 'outbounddeparttime',
    inboundarrivetime: 'inboundarrivetime',
    inbounddeparttime: 'inbounddeparttime',
    price: 'price'
  },
  // Sort asc desc..             
  sortorders: {
    asc: 'asc',
    desc: 'desc'
  },
  // Morning, afternoon, evening
  maxduration: 1800,
  departtimes: ['M', 'A', 'E'],
  /*
      POST request details:
      URL: http://partners.api.skyscanner.net/apiservices/pricing/v1.0
      [Required	Description	Data Type	Constraints]
      apiKey	Yes	The API Key to identify the customer	String	Must be a valid API Key
      country	Yes	The user’s market country	String	ISO country code, or specified location schema
      currency	Yes	The user’s currency	String	ISO currency code
      locale	Yes	The user’s localization preference	String	ISO locale code (language and country)
      originplace	Yes	The origin city or airport	String	Specified location schema, or Skyscanner Rnid
      destinationplace	Yes	The destination city or airport	String	Specified location schema, or Skyscanner Rnid
      outbounddate	Yes	The departure date	Date	Formatted as YYYY-mm-dd
      inbounddate	No	The return date	Date	Formatted as YYYY-mm-dd
      locationschema	No	The code schema used for locations	String	The supported codes are below
      cabinclass	No	The Cabin Class	String	The supported codes are below
      adults	Yes	The number of adults	Int	Defaults to 1 if not specified. Maximum 8
      children	No	The number of children	Int	Defaults to 0, maximum 8
      infants	No	The number of infants	Int	Defaults to 0, cannot exceed adults
      groupPricing	No	Show price-per-adult (false), or price for all passengers (true)	bool	Defaults to false
      EXTRA INFO:
      Code	Values
      currency	The Currencies Service is available to display supported currencies.
      locale	The Locales Service is available to display supported locales.
      locationschema	Iata, GeoNameCode, GeoNameId, Rnid*, Sky
      cabinclass	Economy*, PremiumEconomy, Business, First
      Response Details
      A successful response contains no content. The URL to poll the booking details is specified in the Location header of the response.
      An unsuccessful response will detail the validation failure or state that there was an error.
      Response Headers
      Location Header	Contains the URL for polling the newly created session.
  */
  obtainSessionKey(obj) {
    return new Promise((resolve, reject) => {

      if (!obj) return reject(new Error('Invalid object supplied to obtainSessionKey: ' + arguments.toString()))

      obj.apiKey = apiKey
      const sendData = querystring.stringify(obj)
      const contentLength = sendData.length
      const _this = this
      request({
        headers: {
          'Content-Length': contentLength,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        uri: skyScannerApiEndPoint,
        body: sendData,
        method: 'POST'
      }, function (err, res, body) {
        if (err) {
          return reject(err)
        } else {
          sails.log.debug(res.headers)
          const result = JSON.parse(res.body)
          if (result.ValidationErrors) {
            console.log(body)
            return reject({ error: result.ValidationErrors })
          } else {
            return resolve({ url: res.headers.location })
          }
        }
      })
    })
  },

  /*
      GET REQUEST information: 
      (Note that this request must be sent AFTER first obtaining a session key from skyscanner.)
      [param  required  type notes] - REQUEST DETAILS
      apiKey	Yes	The API Key to identify the customer	String	Must be a valid API Key
      locationschema	No	The code schema used for locations	String	The supported codes are below
      carrierschema	No	The code schema to use for carriers	String	The supported codes are below
      sorttype	No	The property to sort on. If specified, you must also specify sortorder	String	The supported values are below
      sortorder	No	Sort direction	String	‘asc’ or ‘desc’
      originairports	No	Origin airports to filter on	String	List of airport codes delimited by ‘;’
      destinationairports	No	Destination airports to filter on	String	List of airport codes delimited by ‘;’
      stops	No	Filter for maximum number of stops	Int	Between 0 and 3
      outbounddeparttime	No	Filter for outbound departure time by time period of the day (i.e. morning, afternoon, evening)	String	List of day time period delimited by ‘;’ (acceptable values are M, A, E)
      outbounddepartstarttime	No	Filter for start of range for outbound departure time	String	Format as ‘hh:mm’
      outbounddepartendtime	No	Filter for end of range for outbound departure time	String	Format as ‘hh:mm’
      inbounddeparttime	No	Filter for inbound departure time by time period of the day (i.e. morning, afternoon, evening)	String	List of day time period delimited by ‘;’ (acceptable values are M, A, E)
      inbounddepartstarttime	No	Filter for start of range for inbound departure time	String	Format as ‘hh:mm’
      inbounddepartendtime	No	Filter for end of range for inbound departure time	String	Format as ‘hh:mm’
      duration	No	Filter for maximum duration in minutes	Int	Between 0 and 1800
      includecarriers	No	Filter flights by the specified carriers	String	Must be semicolon-separated Iata carrier codes.
      excludecarriers	No	Filter flights by any but the specified carriers	String	Must be semicolon-separated Iata carrier codes.
      OPTIONAL:
      pageindex	0	The desired page number	Int
      pagesize	10	The number of itineraries per page	Int
      includeQuery	false	Whether or not to repeat the query in the poll session	Boolean
      skipCarrierLookup	1050;881;1859	A semicolon separated list of carried Ids which have already been sent to the client in this pricing session, and hence will not be re-sent in subsequent polls	List of integers
      skipPlaceLookup	11235;13542;16189	A semicolon separated list of place Ids which have already been sent to the client in this pricing session, and hence will not be re-sent in subsequent polls	List of integers
      includeCurrencyLookup	false	Whether or not to repeat the currency lookup information in the subsequent poll session	Boolean
      includeBookingDetailsLink	false	Whether or not to show the BookingDetailsLink for each itinerary in the subsequent poll session. If false, the client will have to build this booking details link manually
              
      RESPONSE BODY:
      SessionKey	The Session key to identify the session.
      Query	A copy of the query which was submitted.
      Status	The status of the session – ‘UpdatesPending’ or ‘UpdatesComplete’.
      Itineraries	A list of itineraries - see below for the itinerary object.
      Legs	Details of the itinerary legs that make up the itineraries: airports, times, overall duration, stops and carrier ids.
      Carriers	Lookup for carriers by numeric id.
      Agents	Lookup for agents by numeric id.
      Places	Lookups for places - the whole hierarchy is included, each item has a link to its parent.
      Currencies	Details on how to display any currencies in the pricing options.
  */
  retrieveItin(urlEndpoint, obj) {
    return new Promise((resolve, reject) => {
      if (!obj || !urlEndpoint) {
        return reject(new Error('Invalid parameters when calling retrieve itin '))
      }

      obj.apiKey = apiKey

      // Encode the obj as a query string..
      const queryString = querystring.stringify(obj)

      const _this = this

      GlobalCache.cache({
        GlobalCache: 'skyscanner_flight_search'
      }).getData(queryString)
        .then(function (result) {
          if (result) {
            return resolve(result)
          } else {
            var failCount = 0
            request({
              headers: {
                'Accept': 'application/json'
              },
              uri: urlEndpoint + '?' + (queryString || ''),
              method: 'GET'
            }, function (err, res, body) {
              if (err) return reject(err)
              try {
                const bd = JSON.parse(res.body)

                if (bd.ValidationErrors) {
                  const error = new Error('Validation errors when retriving itinerary from SkyScannerService')
                  sails.log.error(error)
                  return reject(error)
                } else if (!bd.SessionKey || res.statusCode != 200) {
                  throw new Error('Invalid response when retrieving itinerary in SkyScannerFlightSever.js')
                } else if (bd.Status == 'UpdatesPending') {
                  return resolve(_this.retrieveItin(urlEndpoint, obj))
                } else {
                  GlobalCache.cache({
                    GlobalCache: 'skyscanner_flight_search'
                  }).insertData(queryString, bd)
                  return resolve(bd)
                }
              } catch (err) {
                if (failCount < 3) {
                  failCount++
                  return resolve(_this.retrieveItin(urlEndpoint, obj))
                } else {
                  return reject(err)
                }
              }
            })
          }
        }).catch(function (err) {
        sails.log.error(err)
      })
    })
  },
  // Obtains a session key and itinerary using the specified request objects and returns the interneraries.
  makeLivePricingApiRequest(sessionKeyObj, itinObj) {
    const _this = this
    return new Promise((resolve, reject) => {
      _this.obtainSessionKey(sessionKeyObj).then((result) => {
        console.log('recieved url from obtain session key: ' + result.url)
        if (!result.url) return Promise.reject(new Error('Could not obtain session key from our services'))
        _this.retrieveItin(result.url, itinObj).then((result) => {
          return resolve(result)
        }).catch((err) => {
          sails.log.debug('Error retrieving itin ' + JSON.stringify(err) + err.message)
          return reject(err)
        })
      }).catch((err) => {
        sails.log.debug('Error obtaining session key ' + JSON.stringify(err))
        return reject(err)
      })
    })
  },
  /*
      PUT request:http://partners.api.skyscanner.net/apiservices/pricing/v1.0/{session key}/booking?apiKey={apiKey}
      [Parameter	Required	Description	Data Type	Constraints]
      apiKey	Yes	The API Key to identify the customer	String	Must be a valid API Key
      outboundlegid	Yes	The outbound leg Id of the itinerary	String	Must be a valid leg ID
      inboundlegid	Yes (for return)	The inbound leg Id of the itinerary for return flights	String	Must be a valid leg ID
      adults	No	The number of adults	Int	Defaults to 1, maximum 8
      children	No	The number of children	Int	Defaults to 0, maximum 8
      infants	No	The number of infants	Int	Defaults to 0, cannot exceed adults
      A successful response contains no content. The URL to poll the booking details is specified in the Location header of the response.
      An unsuccessful response will detail the validation failure or state that there was an error.
      The Response
      Location Header	Contains the URL for polling the the booking details.
  */
  requestForBookingDetails(obj) {
    return new Promise((resolve, reject) => {
      if (!obj || !obj.sessionkey) {
        return reject(ErrorUtils.createNewError('Invalid parameters when calling requestForBookingDetails', arguments))
      }

      const requestLoc = 'http://partners.api.skyscanner.net/apiservices/pricing/v1.0/${obj.sessionkey}/booking?'
      // Remove the session key before url encoding the object
      delete obj.sessionkey

      const finalRequestURI = requestLoc + querystring.stringify(obj)

      request({
        headers: {
          'Accept': 'application/json'
        },
        uri: finalRequestURI,
        method: 'PUT'
      }, function (err, res, body) {
        if (err) return reject(err)
        else return resolve({ url: res.headers.location })
      })
    })
  },
  /*
      Polling the Booking Details (GET)
      http://partners.api.skyscanner.net/apiservices/pricing/v1.0/{session key}/booking/{itinerary key}?apiKey={apiKey}
      Getting the session key and itinerary key: the full polling URL, including the session key and itinerary key,
      is obtained from the Location header in the response to the Booking Details request.
      Parameters (Query string)
      [Parameter	Required	Description	Data Type	Constraints]
      apiKey	Yes	The API Key to identify the customer	String	Must be a valid API Key
      locationschema	No	The code schema used for locations	String	The supported codes are below
      carrierschema	No	The code schema to use for carriers	String	The supported codes are below
      Optional Parameters for Mobile Usage
      Parameter	Sample Value	Description	Data Type
      includeQuery	false	Whether or not to repeat the query in the subsequent polls	Boolean
      skipCarrierLookup	1050;881;1859	A semicolon separated list of carried Ids which have already been sent to the client in this booking details session, and hence will not be re-sent in subsequent polls	List of integers
      skipPlaceLookup	11235;13542;16189	A semicolon separated list of place Ids which have already been sent to the client in this booking details session, and hence will not be re-sent in subsequent polls	List of integers
  */
  pollBookingDetails(pollingUrl, obj) {
    return new Promise(function (resolve, reject) {
      if (!obj || !pollingUrl) {
        return reject(new Error('Invalid parameters when calling pollBookingDetails'))
      }

      if (!obj.apiKey)
        obj.apiKey = this.apiKey

      const queryString = querystring.stringify(obj)

      request({
        headers: {
          'Accept': 'application/json'
        },
        uri: pollingUrl + '?' + querystring,
        method: 'GET'
      }, function (err, res, body) {
        if (err) return reject(new Error('Error in request response in pollBookingDetails '))
        else return resolve({
            body: res.body,
            nextPollUrl: res.headers.location
          })
      })
    })
  },

  requestAndPollBookingDetails(bookingDetailsObj, pollingDetailsObj) {
    return new Promise((resolve, reject) => {
      this.requestForBookingDetails(bookingDetailsObj).then(
        (result) => {
          this.pollBookingDetails(result, pollingDetailsObj).then((resolvedObj) => {
            const responseBody = resolvedObj.body
            const nextPollUrl = resolvedObj.nextPollUrl

            console.log(responseBody)
            console.log(nextPollUrl)

            resolve(resolvedObj)
          }).catch((error) => reject(new Error('Error occured polling booking details')))
        }
      ).catch((error) => reject(new Error('Error occurred requesting booking details')))
    })
  }
}
// The session request object
exportObj.sessionObj = {
  country: 'ISO country code',
  currency: 'ISO currency code/currencies service',
  locale: 'ISO locale code (language and country)/Locales Service',
  originplace: 'Origin City/Airport as specified in location schema',
  destinationplace: 'Dest City/Airport as specified in location schema',
  outbounddate: 'YY-mm-dd',
  inbounddate: 'YY-mm-dd',
  locationschema: exportObj.locationschemas.Iata,
  cabinclass: exportObj.cabinclasses.Economy,
  adults: 1,
  children: 0,
  infants: 0,
  groupPricing: false
}
// Itinerary request object
exportObj.itinObj = {
  locationschema: exportObj.locationschemas.Iata, // location schema
  carrierschema: exportObj.carrierschemas.Iata, // carrier schema
  sorttype: exportObj.sorttypes.price,
  sortorder: exportObj.sortorders.asc, // 'asc' || 'desc'
  originairports: null, // Filter outgoing airports delim by ';'
  destinationairports: null, // Filter incoming airports delim by ';'
  maxStops: 10, // Max number of stops
  outbounddeparttime: exportObj.departtimes.join(';'),
  outbounddepartstarttime: null, // Start of depart time 'hh:mm'
  outbounddepartendtime: null, // End of depart time 'hh:mm'
  inbounddeparttime: exportObj.departtimes.join(';'),
  inbounddepartstarttime: null, // Start of depart time 'hh:mm'
  inbounddepartendtime: null, // Start of depart time 'hh:mm'
  duration: exportObj.maxduration, // Max flight duration
  includecarriers: null, // Iata carrier codes
  excludecarriers: null, // Iata carrier codes
}
// Booking details request object
exportObj.bookingDetailsObj = {
  outboundlegid: null,
  inboundlegid: null,
  adults: 1,
  children: 0,
  infants: 0,
  sessionkey: null
}
// Booking details polling object
exportObj.bookingDetailsPollingObj = {
  locationschema: exportObj.locationschemas.Iata,
  carrierschema: exportObj.carrierschemas.Iata
}

module.exports = exportObj
