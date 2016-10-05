module.exports = {
    newUserMapSearch(user, origin, destination) {
        return UserSearch.create({
            user: req.user.id,
            originAirportName: origin.airportName,
            originAirportCity: origin.name,
            originAirportCityId: origin.airportCityId,
            originAirportCountry: origin.countryName,
            originAirportCountryCode: origin.countryId,
            originAirportCurrency: origin.currency,
            originAirportId: origin.airportId,
            originAirportIataOrFaaCode: origin.iataCode,
            originAirportIcaoCode: origin.IcaoCode,
            originAirportLatitude: origin.airportPos.lat,
            originAirportLongitude: origin.airportPos.lng,
            originAirportContinent: origin.continentName,
            originAirportContinentId: origin.continentId,
            destinationAirportName: destination.airportName,
            destinationAirportCity: destination.name,
            destinationAirportCityId: destination.airportCityId,
            destinationAirportCountry: destination.countryName,
            destinationAirportCountryCode: destination.countryId,
            destinationAirportCurrency: destination.currency,
            destinationAirportId: destination.airportId,
            destinationAirportIataOrFaaCode: destination.iataCode,
            destinationAirportIcaoCode: destination.IcaoCode,
            destinationAirportLatitude: destination.airportPos.lat,
            destinationAirportLongitude: destination.airportPos.lng,
            destinationAirportContinent: destination.continentName,
            destinationAirportContinentId: destination.continentId
        });
    }
}