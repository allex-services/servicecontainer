function createServiceContainerService(execlib,ParentService){
  'use strict';
  var dataSuite = execlib.dataSuite,
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
  ParentService.inherit(ServiceContainerService,factoryCreator,require('./storagedescriptor'));
  ServiceContainerService.prototype.__cleanUp = function(){
    ParentService.prototype.__cleanUp.call(this);
  };
  ServiceContainerService.prototype.createStorage = function(storagedescriptor){
    return new MemoryStorage(storagedescriptor);
  };
  ServiceContainerService.prototype._onSubServiceDown = function(sinkinstancename,record){
    this.subservices.unregister(sinkinstancename);
    console.log('container deleting record with instancename',sinkinstancename);
    this.data.delete(this._deleteFilterForRecord(sinkinstancename, record));
  };
  ServiceContainerService.prototype._deleteFilterForRecord = function (sinkinstancename, record) {
    return {
      op:'eq',
      field:'instancename',
      value:sinkinstancename
    };
  };
  return ServiceContainerService;
}

module.exports = createServiceContainerService;
