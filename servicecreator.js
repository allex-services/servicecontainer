function createServiceContainerService(execlib,ParentService){
  'use strict';
  var dataSuite = execlib.dataSuite,
    MemoryStorage = dataSuite.MemoryStorage,
    lib = execlib.lib,
    q = lib.q,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  function factoryCreator(parentFactory){
    return {
      'service': require('./users/serviceusercreator')(execlib,parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib,parentFactory.get('user')) 
    };
  }

  function ServiceContainerService(prophash){
    ParentService.call(this,prophash);
    this.restoreDefer = q.defer();
  }
  ParentService.inherit(ServiceContainerService,factoryCreator,require('./storagedescriptor'));
  ServiceContainerService.prototype.__cleanUp = function(){
    this.restoreDefer = null;
    ParentService.prototype.__cleanUp.call(this);
  };
  ServiceContainerService.prototype.onSuperSink = function (supersink) {
    taskRegistry.run('readFromDataSink', {
      sink: supersink,
      filter: null,
      cb: this.restoreContainees.bind(this, supersink),
      errorcb: this.restoreDefer.resolve.bind(this.restoreDefer, false)
    });
  };
  ServiceContainerService.prototype.createStorage = function(storagedescriptor){
    return new MemoryStorage(storagedescriptor);
  };
  ServiceContainerService.prototype.restoreContainees = function (supersink, records) {
    q.all(records.map(this.restoreContainee.bind(this, supersink))).then(
      this.restoreDefer.resolve.bind(this.restoreDefer, true)
    );
  };
  ServiceContainerService.prototype.restoreContainee = function (supersink, record) {
    return supersink.call('restoreFromDB', record);
  };
  ServiceContainerService.prototype._onSubServiceDown = function(sinkinstancename,record){
    this.subservices.unregister(sinkinstancename);
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
