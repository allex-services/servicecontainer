function createServicePack(execlib){
  'use strict';
  var execSuite = execlib.execSuite,
      dataServicePack = execSuite.registry.register('allex_dataservice'),
      ParentServicePack = dataServicePack;

  return {
    Service: require('./servicecreator')(execlib,ParentServicePack),
    SinkMap: require('./sinkmapcreator')(execlib,ParentServicePack),
    Tasks: [{
      name: 'monitorSubServices',
      klass: require('./tasks/monitor')(execlib)
    }]
  };
}

module.exports = createServicePack;
