module.exports = {

  /*
      passportAuthPolicy

       {
      "payer_id"
      "type": "visa",
      "number": "4417119669820331",
      "expire_month": "11",
      "expire_year": "2018",
      "cvv2": "123",
      "first_name": "Joe",
      "last_name": "Shopper"
     }
  */
  storeCreditCard(req, res) {
    const obj = {
      'payer_id': req.user.id,
      'number': [
        req.param('ccPartOne'),
        req.param('ccPartTwo'),
        req.param('ccPartThree'),
        req.param('ccPartFour')
      ].join(''),
      'type': req.param('type'),
      'expire_month': req.param('expire_month'),
      'expire_year': req.param('expire_year'),
      'first_name': req.param('first_name'),
      'last_name': req.param('last_name')
    }

    sails.log.debug(obj)
    // change payer id to req.user.id in none test
    PaypalService.storeCreditCard(obj)
      .then(function (response) {
        if (!req.wantsJSON) {
          req.flash('info', 'Succesfully stored credit card')
          return res.redirect(req.param('redirectSuccess') || req.options.redirectSuccess || 'back')
        } else {
          return res.ok({
            status: 200,
          response})
        }
      }).catch(function (err) {
      sails.log.debug(JSON.stringify(err))

      var m
      if (err.response.name == 'VALIDATION_ERROR') {
        m = err.response.details.map(function (detail) {
          return detail.field.charAt(0).toUpperCase() + detail.field.slice(1) + ': ' + detail.issue
        })
      } else {
        req.flash('danger', 'Unknown error occurred, may be unable to contact paypal at this current moment.')
      }

      if (req.wantsJSON)
        return res.badRequest({error: err,errorMessages: m})

      _.each(m, function (msg) {
        req.flash('danger', msg)
      })

      res.redirect(req.param('redirectFailiure') || req.options.redirectFailiure || 'back')
    })
  },
  destroyCreditCard(req, res) {}
}
