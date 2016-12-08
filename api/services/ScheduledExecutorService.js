const timeUtils = require('../utils/TimeUtils')

/*
    A scheduled executor service for scheduling tasks to execute periodically and after a certain initial delay.

    This module is intended to be used to schedule execution for flight notifications on a daily basis of the cheapest flights.
    Among any other scheduled tasks in which it may be useful for.

    Created by Dale. 
*/

const submittedTasks = {}

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
      const timeUtils = require('../utils/TimeUtils')
      const hourTimeUnit = timeUtils.createTimeUnit(24).Hours
      ScheduleExecutorService.execute({
          key:''
          on:{
              executionBegan(date){
                  //called when execution begins
              },
              executionFinished(date,output){
                  //called when execution finishes
              },
              error(date,error){
                  //called should an error occur
              },
              stop(date){

              }
          }
          work(){
              //Stuff to be done
          },
          maxExecutions:0
      },hourTimeUnit,hourTimeUnit)

      task: the task to execute,
      timeUnitInitialDelay: a time unit object from the TimeUtils utility class, specifies the intial delay period before scheduling execution for this task,
      timeUnitRepeatedDelay: a time unit object from the TimeUtils utility class which specifies the amount on time to wait before repeating this tasks execution.
  */
  execute(task, timeUnitInitialDelay, timeUnitRepeatedDelay) {
    sails.log.debug('Scheduling task ')
    sails.log.debug(task)

    const _self = this

    if (!task || !task.work || !('key' in task))
      throw new Error('Invalid params passed to ScheduleExecutorService.js/execute')

    var repeatedDelay = 0
    var initialDelay = 0

    if (timeUnitRepeatedDelay && typeof timeUnitRepeatedDelay.getValue === 'function')
      repeatedDelay = timeUnitRepeatedDelay.toMilliseconds().getValue()

    if (timeUnitInitialDelay && typeof timeUnitInitialDelay.getValue === 'function')
      initialDelay = timeUnitInitialDelay.toMilliseconds().getValue()

    submittedTasks[task.key] = {
      state: 'pending'
    }

    function triggerEvent (eventType) {
      if (task && task.on && task.on[eventType] && typeof task.on[eventType] == 'function')
        task.on[eventType].apply(null, Array.prototype.slice.call(arguments).slice(1, arguments.length))
    }

    sails.log.debug('Initial delay was: ' + initialDelay)

    setTimeout(function () {
      sails.log.debug('Running set timeout')
      function exec () {
        sails.log.debug('Executing task ' + task.key)
        try {
          triggerEvent('executionBegan', new Date())
          const output = task.work()
          sails.log.debug('Finished executing task ' + task.key)
          submittedTasks[task.key].totalExecutions += 1
          triggerEvent('executionFinished', new Date(), output)

          if (task.maxExecutions && task.maxExecutions > 0 && submittedTasks.totalExecutions == task.maxExecutions) {
            _self.stopScheduledTask(task.key)
            triggerEvent('stop', new Date())
          }
        } catch (err) {
          sails.log.error(err)
          triggerEvent('error', new Date(), err)
          if (repeatedDelay >= 0)
            _self.stopScheduledTask(task.key)
        }
      }

      var clearIntervalKey

      if (repeatedDelay >= 0) {
        sails.log.debug('Setting interval for task.. ' + task.key)
        clearIntervalKey = setInterval(exec, repeatedDelay)
      }

      submittedTasks[task.key].clearIntervalKey = clearIntervalKey || null
      submittedTasks[task.key].totalExecutions = 0
      submittedTasks[task.key].state = 'executing'
      if (repeatedDelay >= 0) {
        triggerEvent('scheduled', new Date())
      }else {
        exec()
      }
    }, initialDelay)
  },

  setOn(key, attr, func) {
    if (!typeof func == 'function') throw new Error('Invalid params passed to setOn in ScheduledExecutorService.js')
    if (!(key in submittedTasks)) throw new Error('Invalid key in setOn in ScheduledExecutorService.js')
    if (!('on' in submittedTasks[key])) throw new Error('Invalid state in ScheduledExecutorService.js setOn')

    submittedTasks[key].on[attr] = func
  },
  stopScheduledTask(options) {
    if (typeof options == 'string' && options in submittedTasks) {
      if (submittedTasks[options].state == 'executing') {
        clearInterval(submittedTasks[options].clearIntervalKey)
        delete submittedTasks[options]
        return true
      } else {
        return false
      }
    }
  }
}
