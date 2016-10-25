module.exports = {
  attributes: {
    owner: {
      model: 'User',
      notNull: true,
      required: true
    },
    members: {
      collection: 'User',
      via: 'flightGroups'
    },
    imagePath: {
      type: 'string',
      defaultsTo: null
    },
    description: {
      type: 'string',
      defaultsTo: '',
    },
    comments: {
      collection: 'FlightGroupComment',
      via: 'flightGroup'
    }
  }
}
