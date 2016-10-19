module.exports = {
  findOrCreateUserLocation(user, userLocation) {
    if(!user || !user.id || !userLocation || !userLocation.coords || !userLocation.address)
        throw new Error('Invalid params to UserLocationService.js/findOrCreateUserLocation');

    UserLocation.findOrCreate({
          user: user.id,
          longitude: userLocation.coords.latitude,
          latitude: userLocation.coords.longitude,
          streetNumber: userLocation.address.streetNumber,
          street: userLocation.address.street,
          route: userLocation.address.route,
          city: userLocation.address.city,
          town: userLocation.address.town,
          region: userLocation.address.region,
          postalCode: userLocation.address.postalCode,
          country: userLocation.address.country,
          countryCode: userLocation.address.countryCode,
          formattedAddress: userLocation.formattedAddress,
          placeId: userLocation.placeId,
          state:userLocation.address.state,
          stateCode:userLocation.address.stateCode,
          timeZoneId: userLocation.timezone.id,
          timeZoneName: userLocation.timezone.name,
          timeZoneAbbr: userLocation.timezone.abbr,
          timeZoneDstOffset: userLocation.timezone.dstOffset,
          timeZoneRawOffset: userLocation.timezone.rawOffset
      }).then(function(userLocation){
          LookupService.rest_countries_get_country_info_by_c_code(userLocation.address.countryCode)
          .then(function(countryInfo){
              if(!countryInfo) return Promise.reject(new Error('Could not find country info'))

            UserAddress.findOrCreate({
              addressLine: userLocation.address.streetNumber + ',' + userLocation.address.street,
              addressLineTwo:userLocation.address.city,
              addressLineThree:userLocation.address.region,
              postcode: userLocation.address.postalCode,
              //Look up tables
              city: userLocation.address.city,
              country:userLocation.address.country,
              countryInfo:,
              state: userLocation.address.state
            }).exec(function(err,address){
              if(err) sails.log.error(err);
            })
          }).catch(function(err){
            sails.log.error(err);
          })

        resolve(userLocation);
    })
  }
}
