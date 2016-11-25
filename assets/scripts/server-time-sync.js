

(function($) {
    $.timeSyncedAjax = function(ajaxObj) {
        const copy = Object.create(ajaxObj);
        const requestSendTime = moment().valueOf();
        $.ajax(
            Object.assign(ajaxObj, {
                success: function(res, ts, xhr) {
                    const responseEndTime = moment().valueOf();
                    if (res.status == 200) {

                        function syncTime(requestSendTime, requestArrivalTime, responseStartTime, responseEndTime) {
                            return {
                                rtripdelay: (responseEndTime - requestSendTime) -
                                    (responseStartTime - requestArrivalTime),
                                responsedelay:responseEndTime - res.responseStartTime,
                                requestdelay:requestArrivalTime - requestSendtime,
                                offset: ((requestArrivalTime - requestSendTime) +
                                    (responseStartTime - responseEndTime)) / 2
                            }
                        }

                        if (copy.success) {
                         copy.success.call(null, res, ts, xhr, syncTime(requestSendTime, res.requestArrivalTime,
                         res.responseStartTime, responseEndTime));
                        }
                    }
                }))
        }
    }
})(jQuery)