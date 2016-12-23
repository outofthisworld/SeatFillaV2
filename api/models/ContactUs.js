module.exports = {
  autoPK:false,
  attributes: {
    id: {
      primaryKey: true,
      type:'string',
      defaultsTo: function () {
        return require('node-uuid').v4()
      }
    },
    firstName: {
      type: 'string',
      notNull: true,
      required: true
    },
    lastName: {
      type: 'string',
      notNull: true,
      required: true
    },
    emailAddress: {
      type: 'string',
      notNull: true,
      required: true
    },
    subject: {
      type: 'string',
      notNull: true,
      required: true
    },
    message: {
      type: 'string',
      notNull: true,
      required: true
    }
  }
}
