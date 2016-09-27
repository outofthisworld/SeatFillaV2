/*
 "userLocation":{"coords":{"latitude":"-36.7835812","longitude":"174.462987","altitude":"","accuracy":"30","altit
                udeAccuracy":"","heading":"","speed":""},"address":{"commonName":"","streetNumber":"117","street":"Mahana Road","route":"M
                ahana Road","neighborhood":"","town":"","city":"Waimauku","region":"Auckland","postalCode":"0881","state":"","stateCode":"
                ","country":"New Zealand","countryCode":"NZ"},"formattedAddress":"117 Mahana Rd, Waimauku 0881, New Zealand","type":"ROOFT
                OP","placeId":"ChIJ2z3AlvUSDW0RdDxZXdsqHn0","timestamp":"1474950287342","flag":"//cdnjs.cloudflare.com/ajax/libs/flag-icon
                -css/2.3.1/flags/4x3/nz.svg","timezone":{"id":"Pacific/Auckland","name":"New Zealand Daylight Time","abbr":"NZDT","dstOffs
                et":"3600","rawOffset":"43200"}}
*/

if (req.user) {
    UserLocation.create({
        user: req.user.id,
        longitude: req.body.userLocation.coords.latitude,
        latitude: req.body.userLocation.coords.longitude,
        streetNumber: req.body.userLocation.address.streetNumber,
        street: req.body.userLocation.address.street,
        route: req.body.userLocation.address.route,
        city: req.body.userLocation.address.city,
        town: req.body.userLocation.address.town,
        region: req.body.userLocation.address.region,
        postalCode: req.body.userLocation.address.postalCode,
        country: req.body.userLocation.address.country,
        formattedAddress: ,
        placeId: ,
        timeZoneId: ,
        timeZoneName: ,
        timeZoneAbbr: ,
        timeZoneDstOffset: ,
        timeZoneRawOffset: ,
    })
}
module.exports = {
    user: {
        model: 'user',
        required: true
    },
    longitude: {
        type: 'string'
        notNull: true
    },
    latitude: {
        type: 'string',
        notNull: true
    },
    streetNumber: {
        type: 'number'
    },
    street: {
        type: 'string'
    },
    route: {
        type: 'string'
    },
    city: {
        type: 'string'
    },
    town: {
        type: 'string'
    }
    region: {
        type: 'string'
    },
    postalCode: {
        type: 'string'
    },
    country: {
        type: 'string'
    },
    countryCode: {
        type: 'string'
    },
    formattedAddress: {
        type: 'string'
    },
    placeId: {
        type: 'string'
    },
    timeZoneId: {
        type: 'string'
    },
    timeZoneName: {
        type: 'string'
    },
    timeZoneAbbr: {
        type: 'string'
    },
    timeZoneDstOffset: {
        type: 'number'
    },
    timeZoneRawOffset: {
        type: 'number'
    }
}