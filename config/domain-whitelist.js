/*
    This file contains domains that have been whitelisted to
    perform HTTP requests to certain services that have the whiteListedDomainPolicy
    attached to them @see policies/whiteListedDomainPolicy.js

    The intended use of this is to make sure that requests to the server for services
    such as user account creation originate from a domain which has been whitelisted in this file.
    This stops adversaries taking advantage of HTTP clients/ Headless HTTP clients/ some other type of
    automated/progmatic way of making HTTP requests to use backend services.

    Created by Dale.
*/

module.exports.domainWhitelist = [
    '127.0.0.1',
    'seatfilla.com',
    'seatfilla.org',
]