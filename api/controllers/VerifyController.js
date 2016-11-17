/**
 * Created by Dale.
 * VerifyControllerController
 */
module.exports = {

  // Get
  email: function (req, res) {
    const verificationId = req.param('verificationId')

    Signup.findOne(verificationId).populate('user')
      .exec(function (err, signup) {
        const user = signup.user

        sails.log.debug('Verifying user' + user)

        if (!user.isEmailVerified) {
          user.isEmailVerified = true
          user.save(function (err) {
            if (err) return res.badRequest('Something went wrong, could not validate email')
            return res.redirect('/user/login')
          })
        } else {
          return res.badRequest('Email is already verified')
        }
      })
  },
  flightRequestPaymentMethods(req, res) {
    if (!req.user) {
      res.redirect('/login?redirectSuccess=/verify/flightRequestPaymentMethods/' + req.params.id)
    } else {
      if (!req.isGET() || !req.params.id)
        return res.badRequest()

      const requestID = req.params.id
      CreditCard.find({
        payer_id: req.user.id,
        valid_until: {
          '>': new Date().toISOString()
        }
      })
        .populate('ccLinks')
        .then(function (creditCards) {
          return res.ok({
            creditCards,
          requestID})
        }).catch(function (err) {
        sails.log.error(err)
        return res.serverError(err)
      })
    }
  },
  /*
    Approves a flight request offer.
    Takes a credit_card id via a previously stored credit card
    and a requestId as parameters in the http request. 
    
    This will be called after a user has passed the flightRequestPayments action
    where a user will confirm acceptance of the accepted flight request and choose their payment options.

    Specifically, the following actions need to occur within this action:
        1. Obtain the credit card associated with the id (async call)
        2. Find the flight request associated with the call (async call)
        3. Charge the users credit card (Note since we are in development mode we are also using paypal sandbox mode, so specific values for credit card will have to be used when entering via the UI ) (async call)
        4. Update users payment status for the accepted flight request (async call)
        5. Payout the provider associated with the accepted flight request if the users payment suceeded
        6. Update the provider payment status and log the batch payment id associated with the payment.
        7. Notify the provider via webhook that we have recieved payment and acceptence from the user
           for the flight, with payout details, and request details.
        8. The action from here is quite dificult to decide on, so hasn't been decided yet:
            8.1 The provider is responsible for emailing the user with flight details after we trigger a webhook.
            OR 8.2 We provide a public API endpoint that allows
        9. Gracefully handle any errors that may occur during this proccess, which could be anything
           ranging from database errors, http errors, credit card processing errors,
           progmatic errors(hopefully not), reponse errors, payout errors,
           webhook errors and so forth. Furthermore, all errors need to be logged so as
           to have a record of something bad occurring.

    Does as many operations as possible asynchronously so as to not hold up
    the main event thread. This method is quite lengthy due to multiple
    asynchronous functions being awaited and called, and due to error handling
    which needs to be done since payments and payouts are being handled.
  */
  approveFlightRequestOffer(req, res) {
    const cc_id = req.param('cc_id')
    const requestId = req.param('requestId')

    function findCreditCard (callback) {
      const errType = 'UnknownCreditCard'
      CreditCard.findOne({
        id: cc_id,
        payer_id: req.user.id
      })
        .then(function (creditCard) {
          if (!creditCard) {
            const error = new Error('Invalid credit card id')
            error.errType = errType
            return callback(error, null)
          }
          return callback(null, creditCard)
        }).catch(callback)
    }

    function findFlightRequest (callback) {
      AcceptedFlightRequests.findOne({
        id: requestId
      })
        .populate('apiUser')
        .populate('flightRequest')
        .then(function (flightRequest) {
          if (!flightRequest) {
            const errType = 'UnknownFlightRequest'
            const error = new Error('Invalid flight request id')
            error.errType = errType
            return callback(error, null)
          }
          if (new Date(flightRequest.validDate) < new Date()) {
            const errorType = 'ExpiredFlightRequestOffer'
            const error = new Error('Flight request offer has expired')
            error.errType = errorType
            return callback(null, error)
          }
          if (flightRequest.userPaymentStatus == 'PAID') {
            const errorType = 'AlreadyPaidError'
            const error = new Error('This flight request has already been paid for.')
            error.errType = errorType
            return callback(null, error)
          } else {
            User.findOne({
              id: flightRequest.user
            })
              .then(function (user) {
                if (!user) {
                  const error = new Error('Unknown flight request user, invalid database state.')
                  const errorType = 'UnknownFlightRequestUser'
                  return callback(error, null)
                } else {
                  flightRequest.user = user
                  return callback(null, flightRequest)
                }
              }).catch(function (err) {
              err.errType = 'UserDBError'
              return callback(err, null)
            })
          }
        }).catch(function (err) {
        err.errorType = 'AcceptedFlightRequestDBError'
        return callback(err, null)
      })
    }

    function chargeUserCreditCard (callback, results) {
      const errorType = 'ChargeUserCreditCard'
      PaypalService.charge_credit_card(
        [{
          'amount': {
            'total': results.findFlightRequest.maximumPayment,
            'currency': results.findFlightRequest.currency
          },
          'description': 'Seatfilla flight - ' + results.findFlightRequest.id
        }], credit_card).then(function (paypal_response) {
        /*
            validate response; A succesfully response should have the following structure:
            There is more information sent with the response from paypal ,however the ID can be used to
            retrieve this information later (e.g for refunds).

        We will only store the id, rather than all information contained within a response.

        {
            "id": "PAY-3AF33469GE649135YKEYTIEQ",
            "create_time": "2013-03-01T23:04:50Z",
            "update_time": "2013-03-01T23:04:55Z",
            "state": "approved",
            "intent": "sale",
        }*/
        if (paypal_response && paypal_response.state && paypal_response.state.toLowerCase() == 'approved') {
          return callback(null, paypal_response)
        } else {
          const error = new Error()
          if (!paypal_response || !paypal_response.state) {
            error.errorMessage = 'Unexpected error, invalid repsponse from PaypalService.charge_credit_card'
            error.errType = errorType
          } else {
            error.errorMessage = 'Payment was not approved'
            error.errType = errorType
          }
          return callback(error, null)
        }
      }).catch(function (err) {
        err.errType = errorType
        return callback(err, null)
      })
    }

    function updateUserPaymentStatus (callback, results) {
      const errType = 'UpdateUserPaymentStatus'
      results.findFlightRequest.userPaymentStatus = 'PAID'
      // This id can be used later on for locating the trasnaction via paypal
      results.findFlightRequest.userPaymentId = results.chargeUserCreditCard.id
      results.findFlightRequest.save(function (err) {
        if (err) {
          err.errType = errType
          return callback(err, null)
        } else return callback(null, 'updated')
      })
    }

    function sendProviderPayment (callback, results) {
      const errType = 'SendProviderPayment'
      PaypayService.createPaypalPayoutSyncMode({
        'recipient_type': 'EMAIL',
        'amount': {
          'value': results.findFlightRequest.maximumPayment,
          'currency': results.findFlightRequest.currency
        },
        'receiver': results.findFlightRequest.apiUser.email, // fix this (this should be the providers paypal email),
        'note': 'Seatfilla - payment for accepted flight ' + results.findFlightRequest.id,
        'sender_item_id': results.findFlightRequest.id
      }).then(function (response) {
        // Validate response
        if (response && response.batch_status && response.batch_status.toLowerCase() == 'success') {
          return callback(null, response)
        } else {
          const error = new Error()
          if (!response || !response.batch_status) {
            error.errorMessage = 'Unexpected response from paypalservice.createPaypalPayoutSyncMode response/response.batch_status was not specified '
            error.errType = errType
            return callback(error, null)
          } else {
            error.errorMessage = 'Unable to send provider payment, batch_status was not `success`'
            error.errType = errType
            return callback(error, null)
          }
        }
      }).catch(function (err) {
        err.errType = errType
        return callback(err, null)
      })
    }

    function updateProviderPaymentStatus (callback, results) {
      const errType = 'UpdateProviderPaymentStatus'
      results.findFlightRequest.providerPayoutStatus = 'PAID'
      results.findFlightRequest.providerPayoutBatchId = results.sendProviderPayment.payout_batch_id
      results.findFlightRequest.providerPayoutItemId = results.sendProviderPayment.items[0].payout_item_id
      results.findFlightRequest.results.findFlightRequest.save(function (err) {
        if (err) {
          err.errType = errType
          return callback(err, null)
        } else {
          return callback(null, 'updated')
        }
      })
    }

    function handleError (err) {
      // Log the error.
      sails.log.error(err)
      /*
        Handle any errors that occur. 
      */
      const errorObj = {
        /*
          None critical errors,
          each do the same thing but may be handled differently in the future 
          so have been split into seperate error types. These errors are not critical,
          They happen before any payments have been made.
        */
        /*
          Function called by all none critical errors.

          redirects the requestto the specified redirectFailiureUrl with information about
          the error stored within `req.flash` via the delegating method
        */
        redirectFailiure() {
          require('../../ErrorUtils').errToJson('/NonCriticalApproveFlightRequestErrors.json', err, {
            useBase: true
          })
          return res.redirect(req.options.redirectFailiureUrl || req.body['redirectFailiureUrl'] || '/')
        },
        // We couldn't find the specified credit card in the database
        UnknownCreditCard() {
          req.flash('error', 'Could not find credit card associated with this request')
          this.redirectFailiure()
        },
        // Couldn't find the flight request specified by the id param
        UnknownFlightRequest() {
          req.flash('error', 'Could not find flight request associated with this request')
          this.redirectFailiure()
        },
        AlreadyPaidError() {
          req.flash('error', 'This has already been paid for.')
          this.redirectFailiure()
        },
        // Failiure occurred charging users credit card
        ChargeUserCreditCard() {
          req.flash('error', 'Error whilst charging credit card.')
          this.redirectFailiure()
        },
        // The flight request offer has `expired` according to the time
        // set forth by the aceptee of this flight request 
        ExpiredFlightRequestOffer() {
          req.flash('error', 'This accepted flight request has expired, you can no longer approve this flight request.')
          this.redirectFailiure()
        },
        // Error occured querying the user table
        UserDBError() {
          req.flash('error', 'Error querying user database.')
          this.redirectFailiure()
        },
        // Error occured querying the accepted flight request table
        AcceptedFlightRequestDBError() {
          req.flash('error', 'Error finding accepted flight request.')
          this.redirectFailiure()
        },
        // Could not find user associated with flight request -> databse state error
        UnknownFlightRequestUser() {
          req.flash('error', 'Error finding user associated with flight request.')
          this.redirectFailiure()
        },
        /* Critical errors (these need to be handled carefully) */
        handleCriticalError(options) {
          const _this = this
          async.auto({
            // First we try and log to a JSON file
            logErrorToFile(callback) {
              if (!options.JSONFilePath)
                return callback(null, null)

                require('../../ErrorUtils').errToJson(options.JSONFilePath, {
                    error: err,
                    errorType: err.errType,
                    errorMessage: err.message,
                    flightRequest: result.findFlightRequest.id,
                    user: result.findFlightRequest.user
                  }, {
                    useBase: true
                },function done(err){
                    if(err){
                        err.errType = 'SaveJsonFailiure';
                        return callback(err,null)
                    }else{
                        return callback(null,true);
                    }
                })
            },
            // Then we try and email the `admin` notifying that the users payment
            // status failed to update as an extra precaution
            sendEmailToAdmin(callback) {
              if (!options.emailAddresses || !options.emailTemplate ||
                !sails.config.email[options.emailTemplate])
                return callback(null, null)

              EmailService.sendEmailAsync(
                // Generate the email template using the supplied arguments.
                sails.config.email[options.emailTemplate].apply(
                  null, options.templateArgs
                )
              ).then(function (info) {
                return callback(null, true)
              }).catch(function (err) {
                sails.log.error(err)
                err.errType = 'EmailSendFailiure'
                return callback(err, null)
              })
            }
          }, function (err, results) {
            if (err) {
              // Something went wrong with the two fail safes, display to the user
              // a way to contact us with the necessary information to
              // lodge an inquiry
              const flightRequestId = result.findFlightRequest.id
              const transactionId = result.chargeUserCreditCard.id
              const state = result.chargeUserCreditCard.state

              //Move these strings into an i18 file later
              
                switch (options.errorType) {
                    // Now display to the user that we have recieved payment but failed to update database
                    // and they can contact us to resolve the issue
                    case 'UpdateUserPaymentStatus':
                    req.flash('criticalErrorTitle', 'We have recieved your payment but failed to update your payment status.')
                    req.flash('criticalErrorMessage',
                        'Please contact us so we can fix this immediately. You can use the following transaction id as a reference : ' + trasactionId + ' along with this flight request id :' + flightRequestId)
                    break
                    case 'SendProviderPayment':
                    case 'UpdateProviderPaymentStatus':
                    // Handle it in this way for now, obviously not ideal
                    req.flash('criticalErrorTitle', 'We have failed to send payment to the provider of this flight.')
                    req.flash('criticalErrorMessage',
                        'Please contact us so we can fix this issue immediately. You can use the following transaction id as a reference : ' + trasactionId + ' along with this flight request id :' + flightRequestId)
                    // Do something here, users been charged, 
                    // we've attempted to email and 
                    sails.log.error(err)
                    break
                    default: // This shouldn't happen
                    throw new Error('Programmer Error in verifycontroller.js')
                }(options.errorType);

                _this.redirectFailiure();
            } else {
              // We've logged the error, handle it manually and 
              // Show success to the user
              return res.redirect(req.options.redirectSuccessUrl || req.body['redirectSuccessUrl'] || '/')
            }
          })
        },
        // The user has payed but we couldn't update their payment status within the database
        UpdateUserPaymentStatus() {
          this.handleCriticalError({
            JSONFilePath: sails.config.appPath + '/UpdateUserPaymentStatusError.json',
            emailAddresses: sails.config.seatfilla.adminEmail,
            emailTemplate: 'userPaymentStatusFailiure',
            templateArgs: [result.findFlightRequest, result.chargeUserCreditCard, err],
            errorType: 'UpdateUserPaymentStatus'
          })
        },
        // The user has paid for the flight but we couldnt sent the provider payment
        SendProviderPayment() {
          this.handleCriticalError({
            JSONFilePath: sails.config.appPath + '/SendProviderPaymentError.json',
            emailAddresses: sails.config.seatfilla.adminEmail,
            emailTemplate: 'sendProviderPaymentFailiure',
            templateArgs: [result.findFlightRequest, err],
            errorType: 'SendProviderPayment'
          })
        },
        // The provider has been payed but we couldn't update their payment status
        UpdateProviderPaymentStatus() {
          this.handleCriticalError({
            JSONFilePath: sails.config.appPath + '/UpdateProviderPaymentStatusError.json',
            emailAddresses: sails.config.seatfilla.adminEmail,
            emailTemplate: 'updateProviderPaymentStatusFailiure',
            templateArgs: [result.findFlightRequest, err],
            errorType: 'UpdateProviderPaymentStatus'
          })
        },
      /* End critical errors */
      }
      if (errorObj[err.errType]) {
        errorObj[err.errType]()
      } else { // Programmer error.
        sails.log.debug('Invalid error object in verifyController.js/approveFlightRequestOffer')
        throw new Error('Invalid error object in verifyController.js/approveFlightRequestOffer')
      }
    }

    async.auto({
      findCreditCard,
      findFlightRequest,
      chargeUserCreditCard: ['findCreditCard', 'findFlightRequest', chargeUserCreditCard],
      updateUserPaymentStatus: ['chargeUserCreditCard', updateUserPaymentStatus],
      sendProviderPayment: ['chargeUserCreditCard', sendProviderPayment],
      updateProviderPaymentStatus: ['sendProviderPayment', updateProviderPaymentStatus],
      notifyProviderOfPayment: ['chargeUserCreditCard', function (callback, results) {
        // Send webhook to provider
      }]
    }, function (err, result) {
      if (err) {
        handleError(err)
      } else {
        // Payment done, send webhook to 
        // provider with transaction details,
        // user details
        // send out payment to flight provider using payments api
        return res.redirect(req.options.redirectSuccessUrl || req.body['redirectSuccessUrl'] || '/')
      }
    })
  }
}
