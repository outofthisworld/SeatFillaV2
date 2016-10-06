/*
    A small utility class for working with different time units.

    Currently supports Hours,Minutes,Seconds and Milliseconds.

    Created by Dale.
*/

module.exports = {
    millisecondsToSeconds(milliseconds) {
        return milliseconds / 1000;
    },

    millisecondsToMinutes(milliseconds) {
        return milliseconds / 1000 / 60;
    },

    millisecondsToHours(millseconds) {
        return milliseconds / 1000 / 60 / 60;
    },

    hoursToMilliseconds(hours) {
        return hours * 60 * 60 * 1000;
    },

    hoursToMinutes(hours) {
        return hours * 60;
    },

    hoursToSeconds(hours) {
        return hours * 60 * 60;
    },

    secondsToMilliseconds(seconds) {
        return seconds * 1000;
    },

    secondsToHours(seconds) {
        return seconds / 60 / 60;
    },

    secondsToMinutes(seconds) {
        return seconds / 60;
    },

    minutesToSeconds(minutes) {
        return minutes * 60;
    },

    minutesToHours(minutes) {
        return minutes / 60;
    },

    minutesToMilliseconds(minutes) {
        return minutes * 60 * 1000;
    },
    createTimeUnit(value) {
        const methods = this;
        const self = this;

        if (!value) value = 0;

        function to(type) {
            return this['to' + type]();
        }

        function convert(toTimeUnit) {
            return this.to(toTimeUnit.type);
        }

        function getValue() {
            return this.value;
        }

        function setValue(amount) {
            this.value = amount;
            return this;
        }

        return {
            Hours: {
                value,
                type: 'Hours',
                convert,
                to,
                getValue,
                setValue,
                toString() { return value + 'Hour(s)'; },
                toMilliseconds() {
                    return self.createTimeUnit(methods.hoursToMilliseconds(value)).Milliseconds;
                },
                toMinutes() {
                    return self.createTimeUnit(methods.hoursToMinutes(value)).Minutes;
                },
                toHours() {
                    return this;
                },
                toSeconds() {

                    return self.createTimeUnit(methods.hoursToSeconds(value)).Seconds;
                }
            },

            Milliseconds: {
                value,
                convert,
                to,
                getValue,
                setValue,
                type: 'Milliseconds',
                toString() { return value + 'Millisecond(s)'; },
                toMilliseconds() {
                    return this;
                },
                toMinutes() {
                    return self.createTimeUnit(methods.millisecondsToMinutes(value)).Minutes;
                },
                toHours() {
                    return self.createTimeUnit(methods.millisecondsToHours(value)).Hours;
                },
                toSeconds() {
                    console.log('in milli');
                    console.log(methods.millisecondsToSeconds(value));
                    return self.createTimeUnit(methods.millisecondsToSeconds(value)).Seconds;
                }
            },

            Minutes: {
                value,
                type: 'Minutes',
                convert,
                to,
                getValue,
                setValue,
                toString() { return valuet + 'Minutes(s)'; },
                toMilliseconds() {
                    return self.createTimeUnit(methods.minutesToMilliseconds(value)).Milliseconds;
                },
                toMinutes() {
                    return this;
                },
                toHours() {
                    return self.createTimeUnit(methods.minutesToHours(value)).Hours;
                },
                toSeconds() {
                    return self.createTimeUnit(methods.minutesToSeconds(value)).Seconds;
                }
            },

            Seconds: {
                value,
                type: 'Seconds',
                convert,
                to,
                getValue,
                setValue,
                toString() { return value + 'Second(s)'; },
                toMilliseconds() {
                    return self.createTimeUnit(methods.secondsToMilliseconds(value)).Milliseconds;
                },
                toMinutes() {
                    return self.createTimeUnit(methods.secondsToMinutes(value)).Minutes;
                },
                toHours() {
                    return self.createTimeUnit(methods.secondsToHours(value)).Hours;
                },
                toSeconds() {
                    return this;
                }
            }
        }
    }
}