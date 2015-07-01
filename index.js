function createServicePack(execlib){
  'use strict';
  var lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    d = q.defer();

  execSuite.registry.register('allex_dataservice').done(
    realCreator.bind(null,d),
    d.reject.bind(d)
  );

  function realCreator(defer, ParentServicePack) {
    defer.resolve({
      Service: require('./servicecreator')(execlib,ParentServicePack),
      SinkMap: require('./sinkmapcreator')(execlib,ParentServicePack),
      Tasks: [{
        name: 'monitorSubServices',
        klass: require('./tasks/monitor')(execlib)
      }]
    });
  }

  return d.promise;
}

module.exports = createServicePack;
