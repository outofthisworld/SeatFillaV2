const timeUtils = require('../api/utils/TimeUtils');


/*
    This module will export any scheduled tasks that will be executed periodically by the server.
    This tasks in turn will submitted to the ScheduledExecutionService by the server bootstrapper in bootstrap.js.

    Created by Dale.
*/

var os = require('os');

const memoryUsageScheduledTask = {
    key: 'memoryUsageScheduledTask',
    on: {},
    work() {
        sails.log.debug('=== PROCESS MEMORY UPDATES ====')
        sails.log.debug('Current heap total: ' +
            process.memoryUsage().heapTotal / 1024 / 1024 + ' MB');
        sails.log.debug('Current heap used: ' +
            process.memoryUsage().heapUsed / 1024 / 1024 + ' MB');
        sails.log.debug('Total memory left: ' +
            ((process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / 1024 / 1024) + ' MB');
        sails.log.debug('OS total memory: ' + os.totalmem() / 1024/ 1024 + ' MB ');
        sails.log.debug('OS available memory: ' + os.freemem()/ 1024/ 1024 + ' MB ')
    }
}

const flightOfferScheduledTask = {
    key: 'flightOfferScheduledTask',
    on: {
        executionBegan(date) {
            //called when execution begins
            sails.log.debug('Began ScheduledExecutionService to notify flight request users of flight offers :' + date);
        },
        executionFinished(date, output) {
            //called when execution finishes
            sails.log.debug('Succesfully notified all flight request users of any flights offers available at seatfilla');
        },
        error(date, error) {
            //called should an error occur
            sails.log.error('Error occured executing ScheduledExecution service to notify flight request users of flight offers ' + date);
            sails.log.error(error)
        },
        stop(date) {
            sails.log.debug('Stopped execution of scheduled task ' + this.key + ' on ' + date);
        }
    },
    work() {

    }
}

const flightRequestScheduledTask = {
    key: 'flightRequestScheduledTask',
    on: {
        executionBegan(date) {
            //called when execution begins
            sails.log.debug('Began ScheduledExecutionService to notify flight request users :' + date);
        },
        executionFinished(date, output) {
            //called when execution finishes
            sails.log.debug('Succesfully ran ScheduledExecutionService to notify all flight request users of any cheap flights.');
        },
        error(date, error) {
            //called should an error occur
            sails.log.error('Error occured executing ScheduledExecution service to notify flight request users of flight requests ' + date);
            sails.log.error(error)
        },
        stop(date) {
            sails.log.debug('Stopped execution of scheduled task ' + this.key + ' on ' + date);
        }
    },
    work() {
        FlightRequest.find().populate('user').then(function(err, flightRequests) {
            if (err) return Promise.reject(err);

            var numRequests = 0;
            var requestStartTime = null;

            flightRequests.forEach(function(request, index) {

                User.findOne({ id: request.user.id }).populate('address').populate('userSettings').then(function(err, user) {



                    //Need iso code >.<
                    const country = user.address.country;
                    const currencyCodePreference = user.userSettings.currencyCodePreference || 'USD';

                    const obj = Object.create(SkyScannerFlightService.sessionObj);
                    obj.country = user.address.country;
                    obj.currency = user.userSettings.currencyCodePreference;
                    obj.locale = user.userSettings.prefferedLocale;
                    obj.originplace = request.originIataCode;
                    obj.destinationplace = request.destinationIataCode;
                    obj.outbounddate = request.departDate;
                    obj.inbounddate = request.returnDate;
                    obj.locationschema = SkyScannerFlightService.locationschemas.Iata;
                    obj.cabinclass = request.cabinClass;
                    obj.adults = request.numAdults;
                    obj.children = request.numChildren;
                    obj.infants = request.numInfants;
                    obj.groupPricing = true;


                    const itinObj = Object.create(SkyScannerFlightService.itinObj);

                    if (!requestStartTime)
                        requestStartTime = new Date().getTime();

                    function makeSkyScannerRequest() {

                        SkyScannerFlightService.makeLivePricingApiRequest(obj, itinObj).then(function(response) {
                            const result = response.result;

                            if (result.Itineraries.length > 0) {

                                const mapItin = function(itin, directionality, legId) {

                                    if (!itin.PricingOptionsMapped) {
                                        itin.PricingOptions = itin.PricingOptions.map((pricingOption) => {
                                            return {
                                                pricingOption,
                                                agents: pricingOption.Agents.map((agentId) => {
                                                    return {
                                                        agentId,
                                                        agent: sf_result.Agents.filter((agent) => {
                                                            return agent.Id == agentId;
                                                        }).pop()
                                                    }
                                                })
                                            }
                                        });
                                        itin.PricingOptionsMapped = true;
                                    }

                                    itin[directionality + 'Legs'] = sf_result.Legs.filter(function(leg) { return leg.Id == legId; }).map(function(leg) {
                                        const _output = Object.assign({}, leg);

                                        _output.FlightNumbers = leg.FlightNumbers.map(function(flightNumberObj) {
                                            const carrierId = flightNumberObj.CarrierId;
                                            return {
                                                flightNumber: flightNumberObj.FlightNumber,
                                                carrierId,
                                                carrierInfo: sf_result.Carriers.filter((carrier) => {
                                                    return carrier.Id == carrierId;
                                                }).pop()
                                            }
                                        });

                                        _output.SegmentIds = leg.SegmentIds.map(function(segmentId) {
                                            return {
                                                segmentId,
                                                segmentInfo: sf_result.Segments.filter(function(segment) {
                                                    return segment.Id == segmentId;
                                                })
                                            }
                                        });

                                        const destinationStationId = leg.DestinationStation;
                                        _output.DestinationStation = sf_result.Places.filter(function(place) {
                                            return place.Id == destinationStationId;
                                        }).pop();

                                        const originStation = leg.OriginStation;
                                        _output.OriginStation = sf_result.Places.filter(function(place) {
                                            return place.Id == originStation;
                                        }).pop();

                                        return _output;
                                    });

                                    return itin;
                                }


                                sf_result.Itineraries.map(function(itin) {
                                    const outboundLegId = itin.OutboundLegId;
                                    const inboundLegId = itin.InboundLegId;

                                    mapItin(itin, 'Outbound', outboundLegId);

                                    if (inboundLegId) {
                                        mapItin(itin, 'Inbound', inboundLegId);
                                    }
                                    return itin;

                                }).forEach(function(itin, index) {

                                    //Filter itin for lowest prices


                                });
                            } else {
                                //Do something with no results for a request??
                            }
                            count++;
                        }).catch(function(err) {
                            return Promise.reject(err);
                        });
                    }

                    /*

                    If we are at a multiple of 10 and the time passed since the request start time
                    has been less than a minute, pause for the remainder of the minute.
                        
                    This is needed because the skyscanner API service that is being used rate limits HTTP requests to 20 requests 
                    per minute. This scheduled execution service will use at most half of that limit so that the website is still able to service
                    requests to users. This is not ideal, and quite a severe limitation that definitely 
                    couldn't be used in a commercial website, but fine for a project...
                        
                    */
                    const execTime = new Date().getTime();
                    if (!(index % 10) && timeUtils.milliSecondsToMinutes(execTime - requestStartTime) < 1) {
                        index = 0;
                        setTimeout(makeSkyScannerRequest, execTime - requestStartTime);
                    } else {
                        makeSkyScannerRequest();
                    }
                }).catch(function(err) {
                    return Promise.reject(err);
                })
            })
        }).catch(function(err) {
            sails.log.error(err);
        });
    }
};

const hasInitialized = false;
module.exports.scheduledtasks = function() {
    if (hasInitialized) return;

    const hourTimeUnit = timeUtils.createTimeUnit(24).Hours;
    [{
            task: flightRequestScheduledTask,
            initialDelay: hourTimeUnit,
            repeatingDelay: hourTimeUnit
        }, {
            task: flightOfferScheduledTask,
            initialDelay: hourTimeUnit,
            repeatingDelay: hourTimeUnit
        },
        {
            task: memoryUsageScheduledTask,
            initialDelay: timeUtils.createTimeUnit(30).Seconds,
            repeatingDelay: timeUtils.createTimeUnit(30).Seconds
        }
    ].forEach(function(task) {
        try {
            ScheduledExecutorService.execute(task.task, task.initialDelay, task.repeatingDelay);
        } catch (err) {
            sails.log.err('Error bootstrapping scheduled task in bootstrap.js');
            sails.log.err(err);
        }
    });

    hasInitialized = true;
}