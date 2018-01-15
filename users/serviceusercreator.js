function createServiceUser(execlib,ParentUser){
  'use strict';

  var lib = execlib.lib,
      q = lib.q,
      qlib = lib.qlib,
      execSuite = execlib.execSuite,
      taskRegistry = execSuite.taskRegistry,
      dataSuite = execlib.dataSuite,
      filterFactory = dataSuite.filterFactory;

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function ServiceUser(prophash){
    ParentUser.call(this,prophash);
  }
  ParentUser.inherit(ServiceUser,require('../methoddescriptors/serviceuser'),[],require('../visiblefields/serviceuser'));
  ServiceUser.prototype.__cleanUp = function(){
    ParentUser.prototype.__cleanUp.call(this);
  };
  ServiceUser.prototype.spawn = function(spawndescriptor,defer){
    if (!(this.__service && this.__service.restoreDefer)) {
      return q.reject(new lib.Error('ALREADY_DYING', 'Service is already destructed'));
    }
    return this.__service.restoreDefer.promise.then(
      this._spawn_or_restore.bind(this, spawndescriptor, false, defer)
    );
  };
  ServiceUser.prototype._spawn_or_restore = function (spawndescriptor, restore, defer) {
    //on success, this method resolves with a Sink instance, making it unusable for remote calls
    var record, sinkinstancename, busy, ret;
    if (!spawndescriptor) {
      defer.reject(new lib.Error('NO_SPAWN_DESCRIPTOR'));
      return;
    }
    record = this._spawnDescriptorToRecord(spawndescriptor);
    sinkinstancename = this._instanceNameFromRecord(record);
    if (!sinkinstancename) {
      defer.reject(new lib.Error('CANNOT_SPAWN_NAMELESS_SUBSERVICE'));
      return;
    }
    busy = this.__service.subservices.busy(sinkinstancename);
    if (!busy) {
      ret = this.__service.subservices.waitFor(sinkinstancename);
      this.acquireSink(record, spawndescriptor).then(
        this._onSinkAcquired.bind(this, record, restore),
        this.__service.subservices.fail.bind(this.__service.subservices)
      );
    } else {
      ret = this.__service.subservices.waitFor(sinkinstancename);
    }
    qlib.promise2defer(ret, defer);
  };
  function rejecter (d) {
    d.reject(new lib.Error('DYING_PREMATURELY'));
  }
  ServiceUser.prototype.kill = function (sinkinstancename, defer) {
    var s = this.__service.subservices.get(sinkinstancename), d;
    if (!s) {
      return q(true);
    }
    if (s.destroyed) {
      d = defer || q.defer();
      s.destroyed.attachForSingleShot(d.resolve.bind(d, true));
      s.destroy();
      return d.promise;
    }
    if (s instanceof lib.Fifo) {
      s.drain(rejecter);
      s.destroy();
      this.__service.subservices.unregister(sinkinstancename);
      return q(true);
    }
    return q(true); //what else?
  };
  function resolver(sink, defer) {
    defer.resolve(sink);
  }
  ServiceUser.prototype._onSinkAcquired = function(record,restore,sink){
    var sinkinstancename = this._instanceNameFromRecord(record);
    if(sinkinstancename){
      this.__service.subservices.registerDestroyable(
        sinkinstancename,sink,
        this.__service._onSubServiceDown.bind(this.__service,sinkinstancename,record)
      );
    }
    return restore ? 
    this._onServiceRecordCreated(sink, record)
    :
    this.__service.data.create(record).then(
      this._onServiceRecordCreated.bind(this,sink)
    );
  };
  ServiceUser.prototype._onServiceRecordCreated = function(sink,record){
    //sink.consumeChannel('s',sink.extendTo(this.__service.data.stateStreamFilterForRecord(record))); //extendTo might be an overkill here?
    var state = taskRegistry.run('materializeState',{
      sink: sink
    });
    this._onSubServiceState(state,record);
    return q(sink);
  };
  ServiceUser.prototype._onSubServiceState = function(state,record){
    state.setSink(state.sink.extendTo(this.__service.data.stateStreamFilterForRecord(record)));
  };
  ServiceUser.prototype._instanceNameFromRecord = function(record) {
    return record.get('instancename');
  };
  ServiceUser.prototype._spawnDescriptorToRecord = function(spawndescriptor){
    var record = new (dataSuite.recordSuite.Record)(this.__service.storageDescriptor.record);
    return record.filterObject(spawndescriptor);
  };
  ServiceUser.prototype.restoreFromDB = function (record, defer) {
    return this._spawn_or_restore(this._recordToSpawnDescriptor(record), true, defer);
  };
  ServiceUser.prototype._recordToSpawnDescriptor = function (record) {
    throw new lib.Error('NOT_IMPLEMENTED', 'Base allex_servicecontainerservice Service does not implement _recordToSpawnDescriptor');
  };

  return ServiceUser;
}

module.exports = createServiceUser;
