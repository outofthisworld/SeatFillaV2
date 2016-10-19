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
        user: user.id
      }).catch(function (err) {
        sails.log.error(err)
      })

      Promise.resolve(userLocation)
    })
  },
  findOrCreateCountry(country) {
    return LookupService.rest_countries_get_country_info_by_c_name(country).then(function (countryInfo) {

      // If the country info doesnt exist...(problem with the country name??)
      if (!countryInfo)
        return Promise.reject({ error: err, message: 'Could not retrieve country info from rest countries in UserService.js/createUser'})

      if (!Array.isArray(countryInfo)) {
        return Promise.reject({ error: new Error(''),
        message: 'Could not retrieve country info from rest countries in UserService.js/createUser'})
      }

      // this is ugly >.< whyyy is data never in a pretty format 
      const mappedCountryInfo = (function mapCountryInfo (object) {
        mappedCountryInfo = {}
        Object.keys(object).forEach((key) => {
          const ele = object[key]

          if (!ele || !ele.key || !ele.data || !(typeof ele.key == 'string') || !(Array.isArray(ele.data)))
            throw new Error('Invalid object formation in UserService.js/mapCountryInfo')

          const eleKey = ele.key
          const eleData = ele.data

          eleData.map((m) => {
            const newObj = {}
            newObj[eleKey] = m
            newObj['countryCode'] = countryInfo.alpha3Code

            return newObj
          })

          mappedCountryInfo[key] = eleData
        })

        return mappedCountryInfo
      })({
        altSpellings: {key: 'alternateSpelling', data: countryInfo.altSpellings},
        translations: {key: 'translation',data: countryInfo.translations},
        timezones: {key: 'timeZone',data: countryInfo.timezones},
        callingCodes: {key: 'callingCode',data: countryInfo.callingCodes},
        borders: {key: 'border',data: countryInfo.borders},
        currencies: {key: 'currencyCode',data: countryInfo.currencies},
        languages: {key: 'language',data: countryInfo.languages}
      })

      sails.log.debug('Mapped country info:')
      sails.log.debug(JSON.stringify(mappedCountryInfo))

      return Country.findOrCreate(
        Object.assign(countryInfo, mappedCountryInfo)
      )
    })
  }
}
