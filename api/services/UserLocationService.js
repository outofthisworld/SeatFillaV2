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

        }).then(function(userLocation) {
            sails.log.debug('Finding or creating user address in UserLocationService.js/findOrCreateUserLocation')
            sails.log.debug(JSON.stringify(userLocation))

            return new Promise(function(resolve, reject) {
                UserService.findOrCreateUserAddress(user.id, {
                    addressLine: userLocation.streetNumber + ',' + userLocation.street,
                    addressLineTwo: userLocation.city,
                    addressLineThree: userLocation.region,
                    formattedAddress: userLocation.formattedAddress,
                    postcode: userLocation.postalCode,
                    // Look up tables
                    city: userLocation.city,
                    country: userLocation.country,
                    state: userLocation.state,
                    user: user.id
                }).then(function(addr) {
                    return resolve({
                        location: userLocation,
                        address: addr
                    })
                }).catch(function(err) {
                    sails.log.error(err)
                    return reject(err);
                })
            })
        }).catch(function(err) {
            sails.log.error(err)
            return Promise.reject(err)
        })
    },
    findOrCreateCountry(country) {
        return LookupService.rest_countries_get_country_info_by_c_name(country).then(function(countryInfo) {

            // If the country info doesnt exist...(problem with the country name??)
            if (!countryInfo) {
                sails.log.debug('Country info before error:')
                sails.log.debug(countryInfo)
                return Promise.reject(new Error('Invalid response'))
            }

            if (!Array.isArray(countryInfo) || countryInfo.length < 1) {
                sails.log.debug('Country info before error:')
                sails.log.debug(countryInfo)
                return Promise.reject(new Error('Invalid response in UserLocationService.js/findOrCreatCountry.js'))
            }

            countryInfo = countryInfo[0]

            // this is ugly >.< whyyy is data never in a pretty format 
            const mappedCountryInfo = (function mapCountryInfo(object) {
                const cInfo = {}

                Object.keys(object).forEach((key) => {

                    const ele = object[key]

                    if (!ele || !ele.key || !ele.data) {
                        throw new Error('Invalid object formation in UserService.js/mapCountryInfo ' + JSON.stringify(ele) +
                            ' ' + JSON.stringify(countryInfo))
                    } else {
                        sails.log.debug('Ele was :' + JSON.stringify(ele) + ' ' + ele)
                    }

                    if (Array.isArray(ele.data)) {
                        const eleKey = ele.key
                        var eleData = ele.data

                        eleData = eleData.map((m) => {
                            const newObj = {}
                            newObj[eleKey] = m
                            newObj['countryCode'] = countryInfo.alpha3Code

                            return newObj
                        })

                        cInfo[key] = eleData
                    } else if (Array.isArray(ele.key)) {
                        const eleKeys = ele.key

                        if (eleKeys.length < 2) throw new Error('Invalid params')

                        const mapp = Object.keys(ele.data).map(function(key) {
                            const data = ele.data[key]
                            const rObj = {}
                            rObj[eleKeys[0]] = key
                            rObj[eleKeys[1]] = data
                            rObj['countryCode'] = countryInfo.alpha3Code
                            return rObj
                        })

                        cInfo[key] = mapp
                    } else {
                        throw new Error('Invalid params in UserLocationService.js/findOrCreateCountry')
                    }
                })

                return cInfo
            })({
                altSpellings: {
                    key: 'alternateSpelling',
                    data: countryInfo.altSpellings || []
                },
                translations: {
                    key: ['lang', 'translation'],
                    data: countryInfo.translations || []
                },
                timezones: {
                    key: 'timeZone',
                    data: countryInfo.timezones || []
                },
                callingCodes: {
                    key: 'callingCode',
                    data: countryInfo.callingCodes || []
                },
                borders: {
                    key: 'border',
                    data: countryInfo.borders || []
                },
                currencies: {
                    key: 'currencyCode',
                    data: countryInfo.currencies || []
                },
                languages: {
                    key: 'language',
                    data: countryInfo.languages || []
                }
            })

            sails.log.debug('Mapped country info:')
            sails.log.debug(JSON.stringify(mappedCountryInfo))



            countryInfo.topLevelDomain = ((countryInfo.topLevelDomain &&
                countryInfo.topLevelDomain.length > 0) && countryInfo.topLevelDomain[0]) || ''
            countryInfo.latlng = countryInfo.latlng && countryInfo.latlng.toString()

            const finalCountry = Object.assign(countryInfo, mappedCountryInfo)
            sails.log.debug('Final country is : ')
            sails.log.debug(JSON.stringify(finalCountry))

            return new Promise(function(resolve, reject) {
                Country.findOrCreate({
                        alpha3Code: countryInfo.alpha3Code
                    },
                    finalCountry
                ).exec(function(err, country) {
                    if (err) {
                        sails.log.debug('Error creating new country')
                        sails.log.error(err)
                        return reject(err)
                    } else {
                        sails.log.debug('Found country record')
                        sails.log.debug(JSON.stringify(country))
                        return resolve(country)
                    }
                })
            })
        }).catch(function(err) {
            sails.log.error(err);
            return Promise.reject(err);
        })
    }
}