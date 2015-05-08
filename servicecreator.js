function createServiceContainerService(execlib,ParentServicePack){
  var ParentService = ParentServicePack.Service,
    dataSuite = execlib.dataSuite,
    MemoryStorage = dataSuite.MemoryStorage;

  function factoryCreator(parentFactory){
    return {
      'service': require('./users/serviceusercreator')(execlib,parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib,parentFactory.get('user')) 
    };
  }

  function ServiceContainerService(prophash){
    ParentService.call(this,prophash);
  }
  ParentService.inherit(ServiceContainerService,factoryCreator,require('./recorddescriptor'));
  ServiceContainerService.prototype.__cleanUp = function(){
    ParentService.prototype.__cleanUp.call(this);
  };
  ServiceContainerService.prototype.createStorage = function(){
    return new MemoryStorage;
  };
  return ServiceContainerService;
}

module.exports = createServiceContainerService;
