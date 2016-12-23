const extract = require('../utils/dbUtils').extractModelAttributes;


module.exports = {
  process_hotel_sale(sale) {
    return new Promise(function (resolve, reject) {
      async.auto({
        find_hotel_sale: function (callback) {
          HotelSale.findOne({ id: sale.id }).populate('hotel').populate('currentWinner')
            .then(function (hotelSale) {
              if (!hotelSale) {
                return callback(new Error('Could not find speicifed sale'),null)
              }
              sails.log.debug('Processing hotel sale, found sale ' + JSON.stringify(hotelSale))
              return callback(null, hotelSale)
            }).catch(callback)
        },
        check_status: ['find_hotel_sale', function (callback, results) {
          if (results.find_hotel_sale.status == 'closed') {
            return callback(new Error('Hotel sale already closed'),null)
          }

          const hours = require('../utils/TimeUtils')
            .createTimeUnit(
              new Date(results.find_hotel_sale.checkInDate) - new Date()
          ).Milliseconds.toHours()

          sails.log.debug('Hours left until check in date: ' + hours)

          if ((results.find_hotel_sale.saleType == 'auction' && hours <= 24
            || results.find_hotel_sale.saleType == 'fixed' && hours <= 0)
            || new Date().toISOString() >= Date.parse(results.find_hotel_sale.openUntil)) {
            return callback(null, {saleType: results.find_hotel_sale.saleType})
          }else {
            return callback(new Error('This hotel sale has no expired'),null);
          }
        }],
        update_status: ['find_hotel_sale', 'check_status', function (callback, results) {
            results.find_hotel_sale.status = 'closed'
            results.find_hotel_sale.save(function (err) {
              if (err) {
                return callback(err, null)
              }else {
                return callback(null, true)
              }
            })
        }],
        find_hotel_sale_min_price:['find_hotel_sale',function(){
          HotelPrices.findOne({hotelSale:results.findHotelSale.id}).min('price_total')
          then(function(hotelPrice){
            return callback(null,hotelPrice);
          }).catch(callback);
        }],
        convert_hotel_min_price_currency:['find_hotel_sale_min_price',function(callback,results){
          if(!results.find_hotel_sale_min_price || results.find_hotel_sale_min_price.currency == 'USD'){
            return callback(null,{maxBid:(results.find_hotel_sale_min_price
              && results.find_hotel_sale_min_price.price_total) || 0, currency:'USD'});
          }

          const pCurrency = results.find_hotel_sale_min_price.currency;
          LookupService.fixer_io_get_exchange_rates(pCurrency)
          .then(function(exchangeRates){
            if(!('rates' in exchangeRates) || !('USD' in exchangeRates.rates)){
              return callback(new Error('Exchange rates.rates was undefined or USD does not exist within returned rates'))
            }
            var conversionRate;
            try{
              conversionRate = parseFloat(exchangeRates.rates.USD);
              return callback(null,{minPrice:parseFloat(results.find_hotel_sale_min_price.price_total) * conversionRate, currency:'USD'});
            }catch(err){
              return callback(err,null);
            }
          }).catch(callback)
        }],
        find_hotel_sale_max_bid:['find_hotel_sale',function(){
          HotelBid.findOne({hotelSale:results.find_hotel_sale.id}).populate('user').max('bidAmount')
          .then(function(bid){
            if(bid && bid.user.username != results.find_hotel_sale.currentWinner.username){
              return callback(new Error('Invalid database state, current winner should be the same as user returned from max hotel sale query.'),null);
            }
            return callback(null,bid);
          }).catch(callback);
        }],
        convert_hotel_max_bid_currency:['find_hotel_sale_max_bid',function(callback,results){
          if(!results.find_hotel_sale_max_bid || results.find_hotel_sale_max_bid.currency == 'USD'){
            return callback(null,{maxBid:(results.find_hotel_sale_max_bid
              && results.find_hotel_sale_max_bid.bidAmount) || 0, currency:'USD'});
          }

          const bidCurrency = results.find_hotel_sale.max_bid.currency;
          LookupService.fixer_io_get_exchange_rates(bidCurrency)
          .then(function(exchangeRates){
            if(!('rates' in exchangeRates) || !('USD' in exchangeRates.rates)){
              return callback(new Error('Exchange rates.rates was undefined or USD does not exist within returned rates'))
            }
            var conversionRate;
            try{
              conversionRate = parseFloat(exchangeRates.rates.USD);
              return callback(null,{maxBid:parseFloat(results.find_hotel_sale_max_bid.bidAmount) * conversionRate, currency:'USD'});
            }catch(err){
              return callback(err,null);
            }
          }).catch(callback)
        }],
        find_winner: ['convert_hotel_max_bid_currency','convert_hotel_min_price_currency', function (callback, results) {
            if(results.find_hotel_sale_max_bid && results.find_hotel_sale_min_price &&
               results.convert_hotel_max_bid_currency.maxBid >= results.convert_hotel_min_price_currency.minPrice){
                 return callback(null,{hasWinner:true})
            }else{
              return callback(null,{hasWinner:false})
            }
        }],
        find_all_bidders:['find_hotel_sale',function(callback,results){
          HotelBids.find({hotelSale:results.find_hotel_sale.id})
          .populate('user')
          .then(function(bids){
            return callback(null,bids);
          }).catch(callback);
        }],
        populate_info:['find_winner','find_hotel_sale',
        'convert_hotel_max_bid_currency',
        'convert_hotel_min_price_currency',function(callback,results){
            return callback(null,{
              winner:results.find_hotel_sale_max_bid.user,
              bidAmount:results.convert_hotel_max_bid_currency.maxBid,
              currency:results.convert_hotel_max_bid_currency.currency,
              hotel:results.find_hotel_sale.hotel,
              reservePrice:results.convert_hotel_min_price_currency.minPrice,
              reservePriceCurrency:results.convert_hotel_min_price_currency.currency
            })
        }],
        notify_all_auction_bidders:['populate_info','find_all_bidders',function(callback,results){
          const template = results.find_winner.hasWinner? sails.config.email.messageTemplates.wonAuctionTemplate :
          sails.config.email.messageTemplates.lostAuctionTemplate
          const email = template(results.populate_info);
          _.each(results.find_all_bidders,function(bidder){
              if(results.find_winner.hasWinner && bidder.user.username == results.find_hotel_sale_max_bid.user.username) return;
              EmailService.sendEmailAsync(email).then(function () {})
          })
        }],
        email_winner: ['find_winner','populate_info', function (callback, results) {
          if (results.find_winner.hasWinner) {
            EmailService.sendEmailAsync(
              sails.config.email.messageTemplates.hotelAuctionWinnerTemplate(results.populate_info)
            ).then(function () {
              return callback(null, true)
            }).catch(function (err) {
              sails.log.error(err)
              return callback(err, null)
            })
          }
          return callback(null, null)
        }],
        notify_winner: ['find_winner', function (callback, results) {
          if (results.find_winner.hasWinner) {
            NotificationService.sendNotification({
              user: results.find_hotel_sale_max_bid.user.id,
              title: 'You have won an auction for hotel ' + results.find_hotel_sale.hotel.hotelName,
              message: 'A bid of ' + results.convert_hotel_max_bid_currency.maxBid + ' ' + results.convert_hotel_max_bid_currency.currency
              + ' was place on hotel ' + results.find_hotel_sale.hotel.hotelName + ' and has won.',
              read: false,
              type: 'Individual',
              link: '/hotel/' + results.find_winner.hotel.id
            }).then(function () {
              return callback(null, true)
            }).catch(function (err) {
              return callback(err, null)
            })
          }
          return callback(null, null)
        }]
      }, function (err, results) {
        if (err) {
          sails.log.error(err)
          return reject(err);
        }else {
          sails.log.debug(results)
          return resolve(results)
        }
      })
    })
  },
  map_response_to_db(options) {
    sails.log.debug('In map response to db')
    sails.log.debug(options)

    const _this = this
    const args = arguments
    return new Promise(function (resolve, reject) {
      const hotel = options.hotel
      const sessionObj = options.sessionObject
      const detailsUrl = options.detailsUrl

      if (!hotel || !sessionObj || !detailsUrl) {
        return reject(new Error('Invalid params to map_response_to_db : ' + JSON.stringify(args)))
      }

      function determine_hours_left (callback, results) {
        const checkInDate = sessionObj.checkindate
        if (!checkInDate) return callback(new Error('Invalid check in date'))
        const dateDif = new Date(checkInDate) - new Date()
        const hours = require('../utils/TimeUtils').createTimeUnit(dateDif).Milliseconds.toHours()
        sails.log.debug('Hours left until date : ' + hours)
        return callback(null, hours.value)
      }

      function determine_sale_type (callback, results) {
        const hours = results.determine_hours_left
        sails.log.debug('hours left until check in date : ' + hours)
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
          hotelName: hotel.hotels[0].name || 'Skyscanner hotel',
          description: hotel.hotels[0].description,
          longitude: hotel.hotels[0].longitude,
          latitude: hotel.hotels[0].latitude,
          websiteURL: hotel.base_host_url,
          detailsUrl: detailsUrl,
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
            sails.log.debug('Found hotel sales: ')
            sails.log.debug(hotelSale)

            if (hotelSale && Array.isArray(hotelSale)) {
              sails.log.debug('checking hotel sails')
              const sales = hotelSale.filter(function (sale) {
                const dateDif = new Date(sale.checkindate) - new Date()
                const hours = require('../utils/TimeUtils').createTimeUnit(dateDif).Milliseconds.toHours()
                if ((sale.saleType == 'auction' && hours <= 24) || (sale.saleType == 'fixed' && hours <= 0)) {
                  _this.process_hotel_sale(sale)
                  return false
                }else if (sale.status == 'closed') {
                  return false
                }else {
                  return true
                }
              })
              if (sales.length)
                sails.log.debug('Found hotel sales ')
              return cb(null, sales)
            } else {
              sails.log.debug('Did not find any sales, creating new sale')
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
        if (results.find_hotel_sale && results.find_hotel_sale.length) {
          sails.log.debug('Not creating hotel sale, already found')
          return cb(null, results.find_hotel_sale)
        }

        var validDate;

        if(results.determine_sale_type == 'auction'){
          validDate = new Date(sessionObj.checkindate);
          validDate.setHours(validDate.getHours() - 24);
        }else{
          validDate = new Date(sessionObj.checkInDate);
        }
        validDate = validDate.toISOString();
        HotelSale.create({
          checkInDate: sessionObj.checkindate,
          checkOutDate: sessionObj.checkoutdate,
          openUntil:validDate,
          numberOfGuests: sessionObj.guests,
          numberOfRooms: sessionObj.rooms,
          hotel: results.create_hotel.id,
          saleType: results.determine_sale_type,
          status: 'open'
        }).then(function (results) {
          sails.log.debug('Succesfully created new hotel sale')
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

            if (!(width > 600 && height > 600)) return

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
            hotel.image = imageObj.fileDescriptor
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
        const tags = [{ tag: 'AVAILABLE'},
        {tag: results.create_hotel.longitude },
        {tag:results.create_hotel.latitude},
        {tag:'${results.create_hotel.star_rating} star'},
        {tag:results.create_hotel.hotelName}]
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
        //const agents = extract(sails.models.hotelagent,hotel.agents);
        // sails.log.debug('extracted agents:')
        // sails.log.debug(agents);
        HotelAgent.findOrCreate({id:_.map(hotel.agents,function(a){return a.id})}, hotel.agents)
          .then(function (agents) {
            return cb(null, agents)
          }).catch(function (err) {
          sails.log.error(err)
          return cb({
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
            return callback(null, exchangeRates)
          }).catch(function (err) {
          sails.log.debug('Error finding exhange rates for ' + sessionObj.currency)
          sails.log.error(err)
          return callback(err)
        })
      }

      function create_hotel_prices (cb, results) {
        sails.log.debug('creating hotel prices')

        if (!hotel.hotels_prices || !hotel.hotels_prices.length) {
          sails.log.debug('Did not find hotel_prices or hotel_prices did not exist ')
          return callback(new Error('No hotel prices'), null)
        }

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
        sails.log.debug('Created hotel prices')
        sails.log.debug(objs)

        HotelPrices.findOrCreate(objs, objs)
          .then(function (hotelPrices) {
            sails.log.debug('Created hotel prices ')
            sails.log.debug(hotelPrices)
            _.each(hotelPrices, function (hotelPrice) {
              results.create_hotel_sale.prices.add(hotelPrice.id)
            })
            results.create_hotel_sale.save(function (err) {
              if (err) {
                sails.log.debug('Error saving hotel sale in hotel_prices')
                return cb(err, null)
              } else {
                sails.log.debug('Succesfully saved hotel sale')
                return cb(null, hotelPrices)
              }
            })
          }).catch(function (err) {
          return cb({
            wlError: err,
            error: new Error('Error creating hotel prices')
          }, null)
        })
      }

      function create_hotel_amenities (cb, results) {
        sails.log.debug('In hotel amenities')

        //sails.log.debug(hotel.amenities)
        //sails.log.debug('extracted:')
       // sails.log.debug(extract(sails.models.hotelamenities,hotel.amenities))

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
        create_hotel_prices: ['create_hotel_sale', 'destroy_hotel_prices', 'create_hotel', 'create_agents', 'get_exchange_rate', create_hotel_prices],
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
