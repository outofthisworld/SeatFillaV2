module.exports = {
  find(req, res) {
    async.auto({
      find_hotel_sales: function (callback) {
        require('../out/re-write/find')(req, res).then(function (hotelSales) {
          if (!hotelSales || !Array.isArray(hotelSales))
            return callback(new Error('Invalid res from `find`'), null)


          const promises = []

          _.each(hotelSales, function (sale, saleIndx) {
            const innerPromises = []
            _.each(sale.bids, function (bid, bidIndx) {
              innerPromises.push(new Promise(function (resolve, reject) {
                User.findOne({id: bid.user}).populate('userProfile').then(function (user) {
                  bid.user = user
                  delete user.password;
                  delete user.passwordConfirmation;
                  return resolve(bid)
                }).catch(function (err) {
                  return reject(err)
                })
              }))
            })

            promises.push(
              new Promise(function (resolve, reject) {
                Promise.all(innerPromises).then(function (bids) {
                  sale.bids = bids
                  return resolve(sale)
                }).catch(callback)
              }))
          })

          HotelSale.subscribe(req, _.map(hotelSales,function(sale){return sale.id}));
          Promise.all(promises).then(function (results) {return callback(null, results)}).catch(callback)
        }).catch(callback)
      }
    }, function (err, results) {
      if (err) {
        sails.log.error(err)
        return res.badRequest({error: error,errorMessages: err.message})
      }else {
        sails.log.debug(results)
        return res.ok(results.find_hotel_sales)
      }
    })
  },
  placeBid(req, res) {
    sails.log.debug('Placing bid:')
    sails.log.debug(req.allParams())

    const user = req.user,
      bidAmount = req.param('bidAmount'),
      currency = req.param('currency'),
      id = req.param('hotelSale')

    const errors = []

    if (!user) {
      errors.push('Must be logged in')
    }

    if (!bidAmount) {
      errors.push('Bid amount not specified')
    }

    if (!currency) {
      errors.push('Invalid currency')
    }

    if (!id) {
      errors.push('Could not find sale')
    }

    if (errors.length) {
      return res.badRequest({error: new Error('ValidationError'),errorMessages: errors})
    }

    async.auto({
      find_hotel_sale: function (callback) {
        HotelSale.findOne({id}).then(function (hotel) {
          if (!hotel) {
            return callback(new Error('Invalid hotelsale id'), null)
          }else {
            sails.log.debug(hotel)
            sails.log.debug(hotel.saleType)

            if (!(hotel.saleType == 'auction')) {
              return callback(new Error('Invalid operation, this hotel is not for auction.'), null)
            }

            if (!(hotel.status == 'open')) {
              return callback(new Error('Invalid operation, this sale is closed.'), null)
            }

            return callback(null, hotel)
          }
        }).catch(callback)
      },
      find_max_bid: [
        'find_hotel_sale',
        function (callback, results) {
          HotelBid.find({hotelSale: id}).max('bidAmount').then(function (bid) {
            if (Array.isArray(bid) && bid.length)
              bid = bid[0]

            if (bid) return callback(null, bid.bidAmount || 0)
            else return callback(null, 0)
          })
        }
      ],
      convert_currency_to_usd: ['find_hotel_sale', function (callback) {
        try {
          const bid = parseFloat(bidAmount)
          sails.log.debug('Parsed bid as float ' + bid)

          LookupService.fixer_io_get_exchange_rates(currency)
            .then(function (exchangeRates) {
              if (!exchangeRates.rates.USD) {
                return callback(new Error('Error find usd conversion rate'), null)
              }

              var usdConversionRate = exchangeRates.rates.USD

              sails.log.debug('USD conversion rate from ' + currency + ' is: ' + usdConversionRate)

              if (!(typeof usdConversionRate == 'number'))
                usdConversionRate = parseFloat(usdConversionRate)

              const usdBid = parseFloat(bid * usdConversionRate)

              if (!(typeof usdBid == 'number'))
                return callback(new Errror('Invalid `type`'))

              return callback(null, usdBid)
            }).catch(function (err) {
            return callback(err, null)
          })
        } catch(err) {
          return callback(err, null)
        }
      }],
      check_bid_amount: ['convert_currency_to_usd', 'find_max_bid', function (callback, results) {
        const hotel = results.find_hotel_sale
        const maxBid = results.find_max_bid
        const usd_bid_amount = results.convert_currency_to_usd

        sails.log.debug('Bid amount in ' + currency + ' was ' + bidAmount)
        sails.log.debug('Bid amount in USD is ' + usd_bid_amount)
        sails.log.debug('Max bid was ' + maxBid)

        if (usd_bid_amount > maxBid)
          return callback(null, true)
        else
          return callback(new Error('Invalid bid amount, must be above the current max bid.'), null)
      }],
      add_bid_to_hotel: ['check_bid_amount', function (callback, results) {
        const hotelSale = results.find_hotel_sale

        try {
          HotelBid.create({
            bidAmount: results.convert_currency_to_usd,
            user: req.user.id,
            hotelSale: hotelSale.id,
            currency: 'USD'
          }).then(function (hotelBid) {
            User.publishAdd(req.user.id,'hotelBids',hotelBid);
            HotelSale.publishAdd(hotelSale.id, 'bids', hotelBid)
            HotelBid.publishCreate(hotelBid)
            return callback(null, hotelBid)
          }).catch(callback)
        } catch(err) {
          return callback(err, null)
        }
      }],
      update_hotel_sale_winner:['add_bid_to_hotel',function(callback,results){
        results.find_hotel_sale.currentWinner = req.user.id;
        results.find_hotel_sale.save(function(err){
          if(err){
            sails.log.error(err)
            return callback(err,null);
          }
          HotelSale.publishUpdate(results.find_hotel_sale.id,results.find_hotel_sale);
          return callback(null,true);
        })
      }],
      notify_bidders: ['update_hotel_sale_winner', function (callback, results) {
        return callback(null, true)
      }],
      email_bidders: ['update_hotel_sale_winner', function (callback, results) {
        return callback(null, true)
      }]
    }, function (err, results) {
      if (err) {
        sails.log.error(err)
        if (res.wantsJSON || req.isSocket) {
          return res.badRequest({errorMessages: err.message,status: 400})
        }else {
          req.flash('toaster-warning', 'Could not place bid ' + err.message)
          return res.redirect(req.param('returnUrl') || 'back')
        }
      }else {
        if (req.wantsJSON || req.isSocket) {
          return res.ok({status: 200})
        }else {
          return res.redirect(req.param('returnUrl') || '/userprofile/' + req.user.username)
        }
      }
    })
  }
}
