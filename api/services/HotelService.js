module.exports = {
  process_hotel_sale(sale) {
    async.auto({
      find_hotel_sale: function (callback) {
        HotelSale.find({ id: sale.id })
          .then(function (hotelSale) {
            return callback(null, hotelSale)
          }).catch(callback)
      }

    }, function (err, results) {})
  },
  map_response_to_db(options) {
    const _this = this
    const args = arguments
    return new Promise(function (resolve, reject) {
      const hotel = options.hotel
      const sessionObj = options.sessionObject
      const hotelData = options.hotelData

      sails.log.debug('Hotel:')
      sails.log.debug(JSON.stringify(hotel))
      sails.log.debug('Session obj: ')
      sails.log.debug(JSON.stringify(sessionObj))
      sails.log.debug('Hotel data:')
      sails.log.debug(JSON.stringify(hotelData))

      if (!hotel || !sessionObj || !hotelData) {
        return reject(new Error('Invalid params to map_response_to_db : ' + JSON.stringify(args)))
      }

      function determine_hours_left (callback, results) {
        const checkInDate = sessionObj.checkindate
        if (!checkInDate) return callback(new Error('Invalid check in date'))
        const dateDif = new Date(checkInDate) - new Date()
        const hours = require('TimeUtils').createTimeUnit(dateDif).Milliseconds.toHours()
        sails.log.debug('Hours left until date : ' + hours)
        return callback(null, hours)
      }

      function determine_sale_type (callback, results) {
        const hours = results.determine_hours_left

        if (hours >= 48) {
          return callback(null, 'auction')
        } else {
          return callback(null, 'fixed')
        }
      }

      function create_hotel (cb, results) {
        Hotel.findOrCreate({
          id: hotel.hotels[0].hotel_id
        }, {
          id: hotel.hotels[0].hotel_id,
          starRating: hotel.hotels[0].star_rating,
          popularity: hotel.hotels[0].popularity,
          hotelName: hotel.hotels[0].name,
          description: hotel.hotels[0].description,
          longitude: hotel.hotels[0].longitude,
          latitude: hotel.hotels[0].latitude,
          websiteURL: hotel.base_host_url,
          detailsUrl: hotelData.detailsUrl,
          callingCode: null,
          phoneNumber: null,
          addressString: hotel.hotels[0].address,
          provider: 'skyscanner'
        }).populate('hotelTags').populate('hotelAmenities').then(function (hotel) {
          sails.log.debug('Created hotel returning cb')
          return cb(null, hotel)
        }).catch(function (err) {
          sails.log.error(err)
          return cb({
            wlError: err,
            error: new Error('Error creating hotel')
          })
        })
      }

      // 48
      // create a sale auction
      function find_hotel_sale (cb, results) {
        const criteriaObj = {
          checkInDate: sessionObj.checkindate,
          checkOutDate: sessionObj.checkoutdate,
          numberOfGuests: sessionObj.guests,
          numberOfRooms: sessionObj.rooms,
          hotel: results.create_hotel.id,
          or: [
            { saleType: 'fixed' },
            { saleType: 'auction' }
          ]
        }
        HotelSale.find(criteriaObj)
          .then(function (hotelSale) {
            if (hotelSale && Array.isArray(hotelSale)) {
              const sales = hotelSale.filter(function (sale) {
                const dateDif = new Date(sale.checkindate) - new Date()
                const hours = require('TimeUtils').createTimeUnit(dateDif).Milliseconds.toHours()
                if (sale.saleType == 'auction' && hours <= 24 || sale.status == 'closed') {
                  _this.process_hotel_sale(sale)
                  return false
                } else {
                  return true
                }
              })
              if (sales.length)
                return cb(null, sales)
            } else {
              return cb(null, null)
            }
          }).catch(function (err) {
          sails.log.error(err)
          return cb({
            wlError: err,
            error: new Error('Error finding hotel sale')
          })
        })
      }

      function create_hotel_sale (cb, results) {
        if (results.find_hotel_sale.length) return callback(null, results.find_hotel_sale)

        HotelSale.create({
          checkInDate: sessionObj.checkindate,
          checkOutDate: sessionObj.checkoutdate,
          numberOfGuests: sessionObj.guests,
          numberOfRooms: sessionObj.rooms,
          hotel: results.create_hotel.id,
          saleType: results.determine_sale_type,
          status: 'open'
        }).then(function (results) {
          return cb(null, results)
        }).catch(function (err) {
          return cb({
            wlError: err,
            error: new Error('Error creating hotel sale')
          })
        })
      }

      function create_hotel_images (callback, results) {
        sails.log.debug('Creating hotel images')
        const baseUrl = hotel.image_host_url
        const hotelImages = hotel.hotels[0].images
        const promises = []

        sails.log.debug(hotelImages)

        _.each(Object.keys(hotelImages), function (key) {
          const pathPart = key
          sails.log.debug('Path part was' + pathPart)
          sails.log.debug('Keys within were ' + Object.keys(hotelImages[key]))
          _.each(Object.keys(hotelImages[key]), function (keyJ) {
            const fileName = keyJ
            if (fileName.includes('order') || fileName.includes('provider')) return
            const dimensions = hotelImages[key][keyJ]
            const width = dimensions[0]
            const height = dimensions[1]
            const fileParts = fileName.split('.')
            const imageObj = {
              hotel: results.create_hotel.id,
              fileDescriptor: baseUrl + pathPart + fileName,
              width,
              height,
              mimeType: null,
              fileName: fileName,
              fileExt: fileParts && fileParts.length == 2 && fileParts[1] || 'Uk'
            }
            sails.log.debug(imageObj)
            promises.push(new Promise(function (resolve, reject) {
              HotelImage.findOrCreate(imageObj, imageObj).then(function (image) {
                return callback(null, image)
              }).catch(function (err) {
                return callback({
                  wlError: err,
                  error: new Error('Error creating hotel images')
                })
              })
            }))
          })
        })
        Promise.all(promises).then(function (done) {
          sails.log.debug('created hotel images')
          return callback(null, done)
        }).catch(function (err) {
          return callback({
            wlError: err,
            error: new Error('Could not create hotel images')
          })
        })
      }

      function destroy_hotel_tags (callback, results) {
        _.each(results.create_hotel.hotelTags, function (hotelTag) {
          results.create_hotel.hotelTags.remove(hotelTag.id)
        })
        results.create_hotel.save(function (err) {
          if (err) {
            return callback({
              wlError: error,
              error: new Error('error saving in destroy tags')
            }, null)
          } else {
            sails.log.debug('succesfully destroyed hotel tags')
            return callback(null, true)
          }
        })
      }

      function destroy_hotel_amenities (callback, results) {
        _.each(results.create_hotel.hotelAmenities, function (hotelAmenity) {
          results.create_hotel.hotelAmenities.remove(hotelAmenity.id)
        })
        results.create_hotel.save(function (err) {
          if (err) {
            return callback({
              wlError: error,
              error: new Error('error saving in destroy tags')
            }, null)
          } else {
            sails.log.debug('succesfully destroyed hotel amenities')
            return callback(null, true)
          }
        })
      }

      function create_hotel_tags (cb, results) {
        const tags = [{
          tag: 'AVAILABLE'
        }]
        HotelTag.findOrCreate(tags, tags)
          .then(function (hotelTag) {
            _.each(hotelTag, function (tag) {
              results.create_hotel.hotelTags.add(tag.id)
            })

            results.create_hotel.save(function (err) {
              if (err) {
                sails.log.debug('Error saving in hotel tags')
                sails.log.error(err)
                return cb(err, null)
              } else {
                sails.log.debug('resolving hotel tags')
                return cb(null, hotelTag)
              }
            })
          }).catch(function (err) {
          sails.log.error(err)
          return cb({
            wlError: err,
            error: new Error('Error finding or creating hotel tag')
          }, null)
        })
      }

      function create_hotel_agents (cb, results) {
        sails.log.debug('creating hotel agents')
        HotelAgent.findOrCreate(hotel.agents, hotel.agents)
          .then(function (agents) {
            return cb(null, agents)
          }).catch(function (err) {
          sails.log.error(err)
          return callback({
            wlError: err,
            error: new Error('Error creating hotel agents')
          })
        })
      }

      function destroy_hotel_prices (callback, results) {
        HotelPrices.destroy({
          hotelSale: results.create_hotel_sale.id
        }).then(function (destroyedPrices) {
          sails.log.debug('destroyed hotel prices')
          return callback(null, destroyedPrices)
        }).catch(function (err) {
          sails.log.error(err)
          return callback({
            wlError: err,
            error: new Error('Error destroying hotel prices')
          }, null)
        })
      }

      function get_exchange_rate (callback) {
        sails.log.debug('Looking up exchange rates')
        LookupService.fixer_io_get_exchange_rates(sessionObj.currency)
          .then(function (exchangeRates) {
            sails.log.debug('Found exchange rates: ' + exchangeRates)
            sails.log.debug(JSON.stringify(exchangeRates))
            return callback(null, exchangeRates)
          }).catch(function (err) {
          sails.log.debug('Error finding exhange rates for ' + sessionObj.currency)
          sails.log.error(err)
          return callback(err)
        })
      }

      function create_hotel_prices (cb, results) {
        if (!results.get_exchange_rate.rates.USD) {
          sails.log.debug('Could not find USD exchange rate')
          return cb(new Error('Error find usd conversion rate'), null)
        }

        sails.log.debug('coverting hotel prices to USD with exchange rate ' + usdExchangeRate)

        var usdExchangeRate = results.get_exchange_rate.rates.USD

        try {
          if (typeof usdExchangeRate != 'number')
            usdExchangeRate = parseFloat(usdExchangeRate)
        } catch (err) {
          return cb(err, null)
        }

        const objs = []

        _.each(hotel.hotels_prices, function (agent_price) {
          const hotelId = agent_price.id
          _.each(agent_price.agent_prices, function (price) {
            const obj = {
              price_total: parseFloat(price.price_total) * usdExchangeRate,
              agent: price.id,
              hotelSale: results.create_hotel_sale.id,
              deeplink: price.deeplink,
              booking_deeplink: price.booking_deeplink,
              currency: 'USD'
            }
            sails.log.debug(obj)
            objs.push(obj)
          })
        })

        sails.log.debug(objs)
        HotelPrices.findOrCreate(objs, objs)
          .then(function (hotelPrices) {
            _.each(hotelPrices, function (hotelPrice) {
              results.create_hotel_sale.prices.add(hotelPrice.id)
            })
            results.create_hotel_sale.save(function (err) {
              if (err) {
                sails.log.debug('Error saving hotel sale in hotel_prices')
                return cb(err, null)
              } else {
                sails.log.debug('Succesfully saved hotel sale')
                return cb(null, true)
              }
            })
          })
      }

      function create_hotel_amenities (cb, results) {
        sails.log.debug('In hotel amenities')

        sails.log.debug(hotel.amenities)

        HotelAmenities.findOrCreate(_.map(hotel.amenities, function (amenities) {
          return amenities.id
        }), hotel.amenities)
          .then(function (amenities) {
            sails.log.debug('Created amenities ' + JSON.stringify(amenities))

            _.each(amenities, function (amen) {
              results.create_hotel.hotelAmenities.add(amen.id)
            })

            results.create_hotel.save(function (err) {
              if (err) {
                sails.log.debug('Error saving in hotel amenities')
                sails.log.error(err)
                return cb(err, null)
              } else {
                return cb(null, amenities)
              }
            })
          }).catch(function (err) {
          return cb({
            wlError: err,
            error: new Error('Error finding or creating amenities')
          }, null)
        })
      }

      async.auto({
        create_hotel: ['determine_sale_type', create_hotel],
        find_hotel_sale: ['create_hotel', find_hotel_sale],
        create_hotel_sale: ['create_hotel', 'determine_sale_type', 'find_hotel_sale', create_hotel_sale],
        create_hotel_images: ['create_hotel', create_hotel_images],
        destroy_hotel_tags: ['create_hotel', destroy_hotel_tags],
        destroy_hotel_amenities: ['create_hotel', destroy_hotel_amenities],
        create_hotel_tags: ['create_hotel', 'destroy_hotel_tags', create_hotel_tags],
        determine_hours_left: determine_hours_left,
        determine_sale_type: ['determine_hours_left', determine_sale_type],
        create_agents: [create_hotel_agents],
        destroy_hotel_prices: ['create_hotel_sale', destroy_hotel_prices],
        get_exchange_rate: get_exchange_rate,
        create_hotel_prices: ['destroy_hotel_prices', 'create_hotel', 'create_agents', 'get_exchange_rate', create_hotel_prices],
        create_hotel_amenities: ['create_hotel', 'destroy_hotel_amenities', create_hotel_amenities]
      }, function (err, results) {
        sails.log.debug('Running final func...')
        if (err) {
          sails.log.debug(err)
          sails.log.error(err)
          return reject(err)
        } else {
          sails.log.debug('Returning, ')
          sails.log.debug(results)
          return resolve(results)
        }
      })
    })
  }
}
