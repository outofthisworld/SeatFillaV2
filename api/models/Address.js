/**
 * Address.js
 *
 */

module.exports = {
    autoPK:false,
    attributes: {
         id: {
            primaryKey: true,
            type:'string',
            defaultsTo: function() {
                return require('node-uuid').v4();
            }
        },
        addressLine: {
            type: 'string',
            required: true,
            notNull: true
        },
        addressLineTwo: {
            type: 'string',
            required: true,
            notNull: true
        },
        addressLineThree: {
            type: 'string',
            notNull: false,
            required: false
        },
        postcode: {
            type: 'string',
            required: true,
            notNull: true
        },
        //Look up tables
        city: {
            type: 'string',
            required: true
        },
        country: {
            type: 'string',
            notNull: true,
            required: true
        },
        countryInfo: {
            type: 'string',
            model: 'Country',
            notNull: true
        },
        state: {
            type: 'string',
            notNull: false,
            required: false
        },
        //One to many
        user: {
            model: 'user',
            notNull: true
        }
    }
};
