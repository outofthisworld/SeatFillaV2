module.exports = {
    createNewUserLocation(user,userLocation){
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
                    countryCode: req.body.userLocation.address.countryCode,
                    formattedAddress: req.body.userLocation.formattedAddress,
                    placeId: req.body.userLocation.placeId,
                    timeZoneId: req.body.userLocation.timezone.id,
                    timeZoneName: req.body.userLocation.timezone.name,
                    timeZoneAbbr: req.body.userLocation.timezone.abbr,
                    timeZoneDstOffset: req.body.userLocation.timezone.dstOffset,
                    timeZoneRawOffset: req.body.userLocation.timezone.rawOffset,
                }).then(function(addr) {
                    sails.log.debug('Succesfully created user location: ' + JSON.stringify(addr));
                }).catch(function(err) {
                    sails.log.error(err);
                });
    }
}