function createTasks(execlib) {
  'use strict';
  return [{
    name: 'monitorSubServices',
    klass: require('./tasks/monitor')(execlib)
  }];
}

module.exports = createTasks;
