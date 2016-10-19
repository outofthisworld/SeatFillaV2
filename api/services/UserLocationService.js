module.exports = {
  findOrCreateUserLocation(user, userLocation) {
    if (!user || !user.id || !userLocation || !userLocation.coords || !userLocation.address)
      throw new Error('Invalid params to UserLocationService.js/findOrCreateUserLocation')

    return UserLocation.findOrCreate({
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
      state: userLocation.address.state,
      stateCode: userLocation.address.stateCode,
      timeZoneId: userLocation.timezone.id,
      timeZoneName: userLocation.timezone.name,
      timeZoneAbbr: userLocation.timezone.abbr,
      timeZoneDstOffset: userLocation.timezone.dstOffset,
      timeZoneRawOffset: userLocation.timezone.rawOffset
    }).then(function (userLocation) {

      UserService.findOrCreateUserAddress({
        addressLine: userLocation.address.streetNumber + ',' + userLocation.address.street,
        addressLineTwo: userLocation.address.city,
        addressLineThree: userLocation.address.region,
        formattedAddress: userLocation.formattedAddress,
        postcode: userLocation.address.postalCode,
        // Look up tables
        city: userLocation.address.city,
        country: userLocation.address.country,
        state: userLocation.address.state,
        user:user.id
      }).catch(function (err) {
        sails.log.error(err)
      })

      Promise.resolve(userLocation)
    })
  }
}
