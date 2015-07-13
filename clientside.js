function createClientSide(execlib, ParentServicePack){
  return {
    SinkMap: require('./sinkmapcreator')(execlib,ParentServicePack),
    Tasks: [{
      name: 'monitorSubServices',
      klass: require('./tasks/monitor')(execlib)
    }]
  };
}

module.exports = createClientSide;
