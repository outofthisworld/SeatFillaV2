/*
    A small utility class for working with different time units.

    Currently supports Hours,Minutes,Seconds and Milliseconds.

    Created by Dale.
*/

module.exports = {
    millisecondsToSeconds(milliseconds) {
        return milliseconds / 1000
    },
    millisecondsToMinutes(milliseconds) {
        return this.millisecondsToSeconds(milliseconds) / 60
    },
    millisecondsToHours(milliseconds) {
        return this.millisecondsToMinutes(milliseconds) / 60
    },
    millisecondsToDays(milliseconds){
        return this.millisecondsToHours(milliseconds) / 24;
    },
    hoursToMilliseconds(hours) {
        return this.hoursToSeconds(hours) * 1000
    },
    hoursToMinutes(hours) {
        return hours * 60
    },
    hoursToSeconds(hours) {
        return this.hoursToMinutes(hours) * 60
    },
    hoursToDays(hours){
        return hours/24;
    },
    secondsToMilliseconds(seconds) {
        return seconds * 1000
    },
    secondsToHours(seconds) {
        return this.secondsToMinutes(seconds) / 60
    },
    secondsToMinutes(seconds) {
        return seconds / 60
    },
    secondsToDays(seconds){
        return this.secondsToHours(seconds) / 24;
    },
    minutesToSeconds(minutes) {
        return minutes * 60
    },
    minutesToHours(minutes) {
        return minutes / 60
    },
    minutesToDays(minutes){
        return this.minutesToHours(minutes)/24;
    },
    minutesToMilliseconds(minutes) {
        return this.minutesToSeconds(minutes) * 1000
    },
    daysToMilliseconds(days){
        return this.daysToSeconds(days) * 1000;
    },
    daysToSeconds(days){
        return this.daysToMinutes(days) * 60;
    },
    daysToMinutes(days){
        return this.daysToHours(days) * 60;
    },
    daysToHours(days){
        return days * 24;
    },
    createTimeUnit(value) {
        const _self = this

        if (!value) value = 0

        function to(type) {
            return this['to' + type]()
        }

        function convert(toTimeUnit) {
            return this.to(toTimeUnit.type)
        }

        function getValue() {
            return this.value
        }

        function setValue(amount) {
            this.value = amount
            return this
        }

        return {
            Hours: {
                value,
                type: 'Hours',
                convert,
                to,
                getValue,
                setValue,
                toString() {
                    return value + 'Hour(s)';
                },
                toMilliseconds() {
                    return _self.createTimeUnit(_self.hoursToMilliseconds(value)).Milliseconds
                },
                toMinutes() {
                    return _self.createTimeUnit(_self.hoursToMinutes(value)).Minutes
                },
                toHours() {
                    return this
                },
                toSeconds() {
                    return _self.createTimeUnit(_self.hoursToSeconds(value)).Seconds
                },
                toDays(){
                    return _self.createTimeUnit(_self.hoursToDays(value)).Days
                }
            },
            Milliseconds: {
                value,
                convert,
                to,
                getValue,
                setValue,
                type: 'Milliseconds',
                toString() {
                    return value + 'Millisecond(s)';
                },
                toMilliseconds() {
                    return this
                },
                toMinutes() {
                    return _self.createTimeUnit(_self.millisecondsToMinutes(value)).Minutes
                },
                toHours() {
                    return _self.createTimeUnit(_self.millisecondsToHours(value)).Hours
                },
                toSeconds() {
                    return _self.createTimeUnit(_self.millisecondsToSeconds(value)).Seconds
                },
                toDays(){
                    return _self.createTimeUnit(_self.millisecondsToDays(value)).Days
                }
            },
            Minutes: {
                value,
                type: 'Minutes',
                convert,
                to,
                getValue,
                setValue,
                toString() {
                    return valuet + 'Minutes(s)';
                },
                toMilliseconds() {
                    return _self.createTimeUnit(_self.minutesToMilliseconds(value)).Milliseconds
                },
                toMinutes() {
                    return this
                },
                toHours() {
                    return _self.createTimeUnit(_self.minutesToHours(value)).Hours
                },
                toSeconds() {
                    return _self.createTimeUnit(_self.minutesToSeconds(value)).Seconds
                },
                toDays(){
                    return _self.createTimeUnit(_self.minutesToDays(value)).Days
                }
            },
            Seconds: {
                value,
                type: 'Seconds',
                convert,
                to,
                getValue,
                setValue,
                toString() {
                    return value + 'Second(s)';
                },
                toMilliseconds() {
                    return _self.createTimeUnit(_self.secondsToMilliseconds(value)).Milliseconds
                },
                toMinutes() {
                    return _self.createTimeUnit(_self.secondsToMinutes(value)).Minutes
                },
                toHours() {
                    return _self.createTimeUnit(_self.secondsToHours(value)).Hours
                },
                toSeconds() {
                    return this
                },
                toDays(){
                    return _self.createTimeUnit(_self.secondsToDays(value)).Days
                }
            },
            Days:{
                value,
                type: 'Days',
                convert,
                to,
                getValue,
                setValue,
                toString() {
                    return value + 'Second(s)';
                },
                toMilliseconds() {
                    return _self.createTimeUnit(_self.daysToMilliseconds(value)).Milliseconds
                },
                toMinutes() {
                    return _self.createTimeUnit(_self.daysToMinutes(value)).Minutes
                },
                toHours() {
                    return _self.createTimeUnit(_self.daysToHours(value)).Hours
                },
                toSeconds() {
                    return _self.createTimeUnit(_self.daysToSeconds(value)).Hours
                },
                toDays(){
                    return this;
                }
            }
        }
    }
}