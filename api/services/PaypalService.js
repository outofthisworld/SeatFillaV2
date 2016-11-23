var paypal = require('paypal-rest-sdk');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AUicGqEhX21up7w8m_NzsIrEA6HP727F5-PeVLQnncmQtJ8LmtDAjp2gbYUGKPs1E6Xd0pLRiK_q40nL',
    'client_secret': 'EIl2WYdjKoid1g9UaZsS-Sbs3md4T4_K7yHayB8vRs5Blo1E23p4BzRX8TC2W568XG3sOJD_ZEn4Nw3W'
});

const c
module.exports = {

    /*
       Send details:
       {
        "payer_id"
        "type": "visa",
        "number": "4417119669820331",
        "expire_month": "11",
        "expire_year": "2018",
        "cvv2": "123",
        "first_name": "Joe",
        "last_name": "Shopper"
       };

       response details:
       {
            "id":"CARD-1MD19612EW4364010KGFNJQI",
            "valid_until":"2016-05-07T00:00:00Z",
            "state":"ok",
            "payer_id":"user12345",
            "type":"visa",
            "number":"xxxxxxxxxxxx0331",
            "expire_month":"11",
            "expire_year":"2018",
            "first_name":"Betsy",
            "last_name":"Buyer",
            "links":[
                {
                "href":"https://api.sandbox.paypal.com/v1/vault/credit-card/CARD-1MD19612EW4364010KGFNJQI",
                "rel":"self",
                "method":"GET"
                },
                {
                "href":"https://api.sandbox.paypal.com/v1/vault/credit-card/CARD-1MD19612EW4364010KGFNJQI",
                "rel":"delete",
                "method":"DELETE"
                }
            ]
        }
    */
    storeCreditCard(data) {
        return new Promise(function(resolve, reject) {
            async.waterfall([
                function(callback) {
                    if (!data.payer_id || !data.type || !data.number || !data.expire_month || !data.expire_year ||
                        !data.first_name || !data.last_name)
                        return callback(new Error('Invalid params specified to store credit card, request not sent.'), null);

                    paypal.creditCard.create(data, function(error, credit_card) {
                        sails.log.debug('Recieved paypal response to store credit card: ' + JSON.stringify(credit_card))
                        if (error || !credit_card || !credit_card.state == 'OK') {
                            sails.log.error(error);
                            return callback(error || new Error('Invalid response storing credit card in PaypalService.js/storeCreditCard'));
                        } else {
                            CreditCard.findOrCreate({
                                id: credit_card.id
                            }, credit_card).then(function(credit_card) {
                                CreditCardLinks.create(credit_card.links.map(function(credit_card_link) {
                                    credit_card_link['credit_card'] = credit_card.id;
                                    return credit_card_link;
                                })).then(function(credit_card_links) {
                                    return callback(null, {
                                        credit_card,
                                        credit_card_links
                                    });
                                }).catch(function(err) {
                                    sails.log.error(err);
                                    CreditCard.destroy({
                                            id: credit_card.id
                                        })
                                        .then(function() {
                                            return callback(err)
                                        }).catch(function(error) {
                                            sails.log.error(error)
                                            return callback([err, error]);
                                        })
                                })
                            }).catch(function(err) {
                                sails.log.error(err)
                                return callback(err, null);
                            })
                        }
                    })
                },
            ], function(err, results) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(results);
                }
            })
        })
    },

    /*
        Charges an existing credit card that is stored via paypal vault.
        Returns a promise with the response, or error should one occur.

        call the function like so:
        charge_credit_card(
            //List of transactions
        [
            {
                "amount":{
                "total": "6.70",
                "currency": "USD"
                },
                "description": "This is the payment transaction description."
            },
        ], user(user the credit card belongs to) || 
           credit_card_token(self made) || 
           CreditCard.id (database record id) || 
           credit_card (database record) )
    */
    charge_credit_card(transactions, options) {
        return new Promise(function(resolve, reject) {
            if (!options || !transactions) return reject(new Error('Invalid params specified to charge credit card'))

            async.waterfall([
                function find_credit_card_dets(callback) {
                    if (options.credit_card_token && options.credit_card_token.credit_card_id && options.credit_card_token.payer_id) {
                        return callback(null, {
                            credit_card_token: options.credit_card_token
                        });
                    }

                    const header = {
                        "credit_card_token": {}
                    }

                    sails.log.debug('Options in charge credit card : ' + JSON.stringify(options))

                    if ((options.credit_card)) {
                        if (options.credit_card.id && options.credit_card.payer_id) {
                            header['credit_card_token']['credit_card_id'] = options.credit_card.id;
                            header['credit_card_token']['payer_id'] = options.credit_card.payer_id;
                            return callback(null, header);
                        } else {
                            return callback(new Error('Invalid params to charge credit card, options.credit_card was set without credit_card_id || payer_id'), null);
                        }
                    }

                    var queryObj = null;
                    if ((options.user || options.payer_id)) {
                        queryObj = {
                            payer_id: options.user.id || options.user || options.payer_id,
                            valid_until: {
                                '>': new Date().toISOString()
                            }
                        };
                    } else if (options.credit_card_id) {
                        queryObj = {
                            id: options.credit_card_id || options.credit_card.id
                        };
                    } else {
                        return callback(new Error('Invalid params specified to charge credit card'), null)
                    }

                    sails.log.debug('Querying credit card with criteria : ' + JSON.stringify(queryObj))
                    CreditCard.findOne(queryObj).then(function(credit_card) {
                        if (credit_card) {
                            header['credit_card_token']['credit_card_id'] = credit_card.id;
                            header['credit_card_token']['payer_id'] = credit_card.payer_id;
                            sails.log.debug('Found credit card: ' + JSON.stringify(credit_card))
                            return callback(null, header);
                        } else {
                            return callback(new Error('No credit card currently available for this user to complete payment.'), null)
                        }
                    }).catch(function(err) {
                        return callback(err, null);
                    })

                },
                function create_payments_object(credit_card_token, callback) {
                    const paymentDetails = {
                        "intent": "sale" || options.intent,
                        "payer": {
                            "payment_method": "credit_card",
                            "funding_instruments": [credit_card_token]
                        },
                        transactions
                    }
                    sails.log.debug('returning payment details')
                    return callback(null, paymentDetails);
                },
                function charge_transactions(paymentDetails, callback) {
                    sails.log.debug('charging transaction')
                    paypal.payment.create(paymentDetails, function(err, res) {
                        if (err) {
                            sails.log.debug('error charing credit card')
                            return callback(err, null);
                        } else {
                            return callback(null, res);
                        }
                    });
                }
            ], function(err, result) {
                if (err) {
                    sails.log.error('Error charing credit card :' + sails.log.error(err))
                    return reject(err);
                } else {
                    sails.log.debug('Result from charge credit card : ' + JSON.stringify(result))
                    return resolve(result);
                }
            })
        })
    },
    /*     
        var create_payout_json = {
            "sender_batch_header": {
                "sender_batch_id": sender_batch_id,
                "email_subject": "You have a payment"
            },
            "items": [
                {
                    "recipient_type": "EMAIL",
                    "amount": {
                        "value": 0.90,
                        "currency": "USD"
                    },
                    "receiver": "shirt-supplier-three@mail.com",
                    "note": "Thank you.",
                    "sender_item_id": "item_3"
                }
            ]
        };
    */
    createPaypalPayoutSyncMode(data) {
        return new Promise(function(resolve, reject) {
            if (!_.isObject(data)) return reject(new Error('Invalid params'))
            var sync_mode = 'true';

            const senderBatchHeader = sender_batch_header = {
                "email_subject": "Payment from Seatfilla"
            }

            if (!Array.isArray(data)) {
                if (!data.sender_batch_header) {
                    data.sender_batch_header = senderBatchHeader;
                }
            } else if (Array.isArray(data)) {
                data = {
                    sender_batch_header: senderBatchHeader,
                    items: data
                }
            }

            paypal.payout.create(data, sync_mode, function(error, payout) {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(payout);
                }
            });
        })

    }

}