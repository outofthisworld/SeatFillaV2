module.exports = {
  attributes: {
    'name': {
      type: 'string'
    },
    'alpha2Code': {
      type: 'string'
    },
    'alpha3Code': {
      type: 'string',
      primaryKey: true
    },
    'callingCodes': {
      collection: 'CountryCallingCodes',
      via: 'countryCode'
    },
    'capital': {
      type: 'string'
    },
    'altSpellings': {
      collection: 'CountryAlternateSpellings',
      via: 'countryCode'
    },
    'region': {
      type: 'string'
    },
    'subregion': {
      type: 'string'
    },
    'translations': {
      collection: 'CountryTranslations',
      via: 'countryCode'
    },
    'population': {
      type: 'integer'
    },
    'latlng': {
      type: 'string'
    },
    'demonym': {
      type: 'string'
    },
    'area': {
      type: 'integer'
    },
    'gini': {
      type: 'string'
    },
    'timezones': {
      collection: 'CountryTimezones',
      via: 'countryCode'
    },
    'borders': {
      collection: 'CountryBorders',
      via: 'countryCode'
    },
    'nativeName': {
      type: 'string'
    },
    'numericCode': {
      type: 'integer'
    },
    'currencies': {
      collection: 'CountryCurrencies',
      via: 'countryCode'
    },
    'languages': {
      collection: 'CountryLanguages',
      via: 'countryCode'
    }
  }
}
