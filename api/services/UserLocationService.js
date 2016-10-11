module.exports = {
  createNewUserLocation(user, userLocation) {
    return UserLocation.create({
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
      timeZoneId: userLocation.timezone.id,
      timeZoneName: userLocation.timezone.name,
      timeZoneAbbr: userLocation.timezone.abbr,
      timeZoneDstOffset: userLocation.timezone.dstOffset,
      timeZoneRawOffset: userLocation.timezone.rawOffset
    })
  }
}
