function createServicePack(execlib){
  var execSuite = execlib.execSuite,
      dataServicePack = execSuite.registry.register('allex_dataservice'),
      ParentServicePack = dataServicePack;

  return {
    Service: require('./servicecreator')(execlib,ParentServicePack),
    SinkMap: require('./sinkmapcreator')(execlib,ParentServicePack)
  };
}

module.exports = createServicePack;
