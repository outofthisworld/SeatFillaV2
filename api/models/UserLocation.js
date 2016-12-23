/*
 "userLocation":{"coords":{"latitude":"-36.7835812","longitude":"174.462987","altitude":"","accuracy":"30","altit
                udeAccuracy":"","heading":"","speed":""},"address":{"commonName":"","streetNumber":"117","street":"Mahana Road","route":"M
                ahana Road","neighborhood":"","town":"","city":"Waimauku","region":"Auckland","postalCode":"0881","state":"","stateCode":"
                ","country":"New Zealand","countryCode":"NZ"},"formattedAddress":"117 Mahana Rd, Waimauku 0881, New Zealand","type":"ROOFT
                OP","placeId":"ChIJ2z3AlvUSDW0RdDxZXdsqHn0","timestamp":"1474950287342","flag":"//cdnjs.cloudflare.com/ajax/libs/flag-icon
                -css/2.3.1/flags/4x3/nz.svg","timezone":{"id":"Pacific/Auckland","name":"New Zealand Daylight Time","abbr":"NZDT","dstOffs
                et":"3600","rawOffset":"43200"}}
*/

module.exports = {
    autoPK:false,
    attributes: {
          id: {
            primaryKey: true,
            type: 'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
        user: {
            model: 'user',
            required: true,
            notNull: true
        },
        longitude: {
            type: 'string',
            notNull: true
        },
        latitude: {
            type: 'string',
            notNull: true
        },
        streetNumber: {
            type: 'integer'
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
        },
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
            type: 'integer'
        },
        timeZoneRawOffset: {
            type: 'integer'
        }
    }
}
