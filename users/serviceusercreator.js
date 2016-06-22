function createServiceUser(execlib,ParentUser){
  'use strict';

  var lib = execlib.lib,
      q = lib.q,
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
    var record, sinkinstancename, busy, ret;
    if (!spawndescriptor) {
      defer.reject(new lib.Error('NO_SPAWN_DESCRIPTOR'));
      return;
    }
    record = this._spawnDescriptorToRecord(spawndescriptor);
    sinkinstancename = this._instanceNameFromRecord(record);
    if (!sinkinstancename) {
      return q.reject(new lib.Error('CANNOT_SPAWN_NAMELESS_SUBSERVICE'));
    }
    busy = this.__service.subservices.busy(sinkinstancename);
    if (!busy) {
      ret = this.__service.subservices.waitFor(sinkinstancename);
      this.acquireSink(record, spawndescriptor).then(
        this._onSinkAcquired.bind(this, record),
        this.__service.subservices.fail.bind(this.__service.subservices)
      );
    } else {
      ret = this.__service.subservices.waitFor(sinkinstancename);
    }
    return ret;
    /*
    var sink = this.__service.subservices.get(sinkinstancename);
    if (sink) {
      if (sink instanceof lib.Fifo){
        sink.push(defer);
      } else {
        defer.resolve(sink);
      }
      return;
    }
    //this.__service.subservices.add(sinkinstancename, new lib.Fifo());
    this.acquireSink(record,spawndescriptor,d);
    d.promise.done(
      this._onSinkAcquired.bind(this,defer,record),
      defer.reject.bind(defer)
    );
    */
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
  ServiceUser.prototype._onSinkAcquired = function(record,sink){
    var sinkinstancename = this._instanceNameFromRecord(record);
    if(sinkinstancename){
      this.__service.subservices.registerDestroyable(
        sinkinstancename,sink,
        this.__service._onSubServiceDown.bind(this.__service,sinkinstancename,record)
      );
    }
    return this.__service.data.create(record).then(
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

  return ServiceUser;
}

module.exports = createServiceUser;
