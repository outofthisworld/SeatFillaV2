const timeUtils = require('../utils/TimeUtils');

module.exports = {

    /*

        Basic format of a task object for working with this function
        task:{
            on:{
                executionBegan:function(date){

                },
                executionFinished:function(date,output){

                },
                error:function(date,error){

                }

            }

            work:function(){

            }

        }

        Call this function in the following way:
        const timeUtils = require('../utils/TimeUtils');
        const hourTimeUnit = timeUtils.createTimeUnit(24).Hours;
        ScheduleExecutorService.execute({
            on:{
                executionBegan(date){
                    //called when execution begins
                },
                executionFinished(date,output){
                    //called when execution finishes
                },
                error(date,error){
                    //called should an error occur
                }
            }
            work(){
                //Stuff to be done
            }
        },hourTimeUnit,hourTimeUnit);


        task: the task to execute,
        timeUnitInitialDelay: a time unit object from the TimeUtils utility class, specifies the intial delay period before scheduling execution for this task,
        timeUnitRepeatedDelay: a time unit object from the TimeUtils utility class which specifies the amount on time to wait before repeating this tasks execution.
    */
    execute(task, timeUnitInitialDelay, timeUnitRepeatedDelay) {

        if (!task || !task.work)
            throw new Error('Invalid params passed to ScheduleExecutorService.js/execute')

        var repeatedDelay = 0;
        var initialDelay = 0;

        if (timeUnitRepeatedDelay && typeof timeUnitRepeatedDelay.getValue === 'function')
            repeatedDelay = timeUnitRepeatedDelay.toMilliseconds().getValue();

        if (timeUnitInitialDelay && typeof timeUnitInitialDelay.getValue === 'function')
            initialDelay = timeUnitInitialDelay.convert(timeUtils.createTimeUnit().Milliseconds).getValue()


        new Promise(function(resolve, reject) {
            setTimeout(function() {
                setInterval(function() {
                    try {

                        if (task.on && task.on.executionBegan && typeof task.on.executionBegan === 'function')
                            task.on.executionBegan(new Date());

                        const output = task.work();

                        if (task.on && task.on.executionFinished && typeof task.on.executionFinished === 'function') {
                            task.on.executionFinished(new Date(), output);
                        }
                    } catch (err) {
                        reject(err);
                    }
                }, repeatedDelay);
            }, initialDelay);
        }).catch(function(err) {
            if (task.on && task.on.error && task.on.error && typeof task.on.error === 'function')
                task.on.error(new Date(), err);
        });
    }
}