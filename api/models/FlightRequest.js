/**
 * Request.js
 *  obj.country = req.body.userLocation.address.countryCode || req.body.origin.airportCountryId || req.body.userLocation.address.country || (req.user && req.user.address.country);
            obj.currency = req.body.prefferedCurrency || UserSettingsService.getUserCurrencyCodePreference(req);
            obj.locale = req.headers['Accept-Language'] || 'en-US';
            obj.originplace = req.body.origin.iataCode;
            obj.destinationplace = req.body.destination.iataCode;
            obj.outbounddate = (req.body.dates && req.body.dates.departure) || (new Date().toISOString().slice(0, 10));
            obj.inbounddate = (req.body.dates && req.body.dates.arrival) || null;
            obj.locationschema = SkyScannerFlightService.locationschemas.Iata;
            obj.cabinclass = SkyScannerFlightService.cabinclasses[req.body.prefferedCabinClass] || SkyScannerFlightService.cabinclasses.Economy;
            obj.adults = (req.body.ticketInfo && req.body.ticketInfo.numAdultTickets) || 1;
            obj.children = (req.body.ticketInfo && req.body.ticketInfo.numChildTickets) || 0;
            obj.infants = (req.body.ticketInfo && req.body.ticketInfo.numInfantTickets) || 0;
            obj.groupPricing = req.body.groupPricing || false;
 */
module.exports = {
    attributes: {
        departureCity: {
            type: 'string',
            required: true,
            notNull: true
        },
        departureCountry: {
            type: 'string',
            required: true,
            notNull: true
        },
        departureCountryId: {
            type: 'string',
            required: true,
            notNull: true
        },
        departureCountryCountryCode: {
            type: 'string',
            required: true,
            notNull: true
        },
        departureIataCode: {
            type: 'string',
            required: true,
            notNull: true
        },
        arrivalCity: {
            type: 'string',
            required: true,
            notNull: true
        },
        arrivalCountry: {
            type: 'string',
            required: true,
            notNull: true
        },
        arrivalCountryId: {
            type: 'string',
            required: true,
            notNull: true
        },
        arrivalCountryCountryCode: {
            type: 'string',
            required: true,
            notNull: true
        },
        arrivalIataCode: {
            type: 'string',
            required: true,
            notNull: true
        },
        requestLocale: {
            type: 'string',
            required: true,
            notNull: true
        },
        groupPricing: {
            type: 'boolean',
            required: true,
            defaultsTo: true
        },
        departureDateStart: {
            type: 'datetime',
            required: true,
            notNull: true
        },
        departureDateEnd: {
            type: 'datetime',
            required: true,
            notNull: true
        },
        returnDateStart: {
            type: 'datetime',
            defaultsTo: null
        },
        returnDateEnd: {
            type: 'datetime',
            defaultsTo: null
        },
        adults: {
            type: 'integer',
            required: true,
            defaultsTo: 1
        },
        children: {
            type: 'integer',
            defaultsTo: 0
        },
        infants: {
            type: 'integer',
            defaultsTo: 0
        },
        currency: {
            type: 'string',
            notNull: true,
            required: true
        },
        cabinClass: {
            type: 'string',
            enum: ['Economy', 'PremiumEconomy', 'First', 'Business'],
            notNull: true,
            required: true
        },
        maximumPayment: {
            type: 'float',
            decimal: true,
            min: 0,
            max: 20001
        },
        timeZoneOffset: {
            type: 'integer',
            notNull: true,
            required: true
        },
        notifySeatfillaFlights: {
            type: 'boolean',
            defaultsTo: true
        },
        status:{
            type:'string'
        },
        //One to many (User can have many requests,
        //request can have one user.)
        user: {
            model: 'user',
            notNull: true,
            required: true
        }
    },
    beforeCreate: function(record, cb) {
        //Checks we have valid date ranges

        new Promise((resolve, reject) => {
            const departureDateStart = new Date(record.departureDateStart);
            const departureDateEnd = new Date(record.departureDateEnd);

            if (!(departureDateStart <= departureDateEnd)) {
                return cb(new Error('Departure start date must be less than departure end date'));
            }

            if (record.returnDateStart) {
                const returnDateStart = new Date(record.returnDateStart);

                if (!(returnDateStart >= departureDateStart) || !(returnDateStart >= departureDateEnd)) {
                    return cb(new Error('Return date must be after departure date'));
                }

                if (record.returnDateEnd) {
                    const returnDateEnd = new Date(record.returnDateEnd);

                    if (!(returnDateEnd >= returnDateStart)) {
                        return cb(new Error('Return date range end must be after the start return date'));
                    }
                }
            }
            return cb();
        });
    }
};