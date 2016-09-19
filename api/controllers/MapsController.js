module.exports = {
    airports(req, res) {
        return res.ok();
    },
    retrieveFlightInfo(req,res){
       const obj =  Object.create(SkyScannerFlightServer.sessionObj);


       exportObj.sessionObj = {
        country: req.param('Country'),
        currency: 'ISO currency code/currencies service',
        locale: req.param('Locale') || req.headers['accept-language'],
        originplace: '',
        destinationplace: req.param('IataOrFaaCode'),
        outbounddate: 'YY-mm-dd',
        inbounddate: 'YY-mm-dd',
        locationschema: exportObj.locationschemas.Iata,
        cabinclass: exportObj.cabinclasses.Economy,
        adults: 1,
        children: 0,
        infants: 0,
        groupPricing: false
    }
    }
}