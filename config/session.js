/**
 * 
 */

module.exports.session = {

    /***************************************************************************
     * Seatfilla session settings
     ***************************************************************************/
    secret: '1dc31168526f10184a8007e2fe6b4d89',
    key: 'seatfilla.session.id',

    //90 mins (ms)
    cookie: {
        maxAge: 1000 * 60 * 90
    },


    /***************************************************************************
     * Dale:
     * 
     * I have configured the Heroku app server with the environmental variables
     * required for the reddis session storage. Reddis session storage enables
     * the app to be ran accross multiple vm instances and for the session variables
     * to be shared.
     * 
     ***************************************************************************/

     adapter: 'memory',
    /*
        adapter: 'redis',
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        //ttl: <redis session TTL in seconds>,
        db: process.env.REDIS_DB || 0,
        pass: process.env.REDIS_PASSWORD,
        // prefix: 'sess:',
    */

    /*
        Use the following settings to enable this app to use mongo as its shared session store:
    */
    // adapter: 'mongo',
    // url: 'mongodb://user:password@localhost:27017/dbname', // user, password and port optional

    // collection: 'sessions',
    // stringify: true,
    // mongoOptions: {
    //   server: {
    //     ssl: true
    //   }
    // }

};