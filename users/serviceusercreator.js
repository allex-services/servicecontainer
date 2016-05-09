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
    if (!spawndescriptor) {
      defer.reject(new lib.Error('NO_SPAWN_DESCRIPTOR'));
      return;
    }
    var d = q.defer();
    var record = this._spawnDescriptorToRecord(spawndescriptor);
    var sinkinstancename = this._instanceNameFromRecord(record);
    if (!sinkinstancename) {
      defer.reject(new lib.Error('CANNOT_SPAWN_NAMELESS_SUBSERVICE'));
      return;
    }
    var sink = this.__service.subservices.get(sinkinstancename);
    if (sink) {
      if (sink instanceof lib.Fifo){
        sink.push(defer);
      } else {
        defer.resolve(sink);
      }
      return;
    }
    this.__service.subservices.add(sinkinstancename, new lib.Fifo());
    this.acquireSink(record,spawndescriptor,d);
    d.promise.done(
      this._onSinkAcquired.bind(this,defer,record),
      defer.reject.bind(defer)
    );
  };
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
      while (s.length) {
        s.pop().reject(new lib.Error('DYING_PREMATURELY'));
      }
      s.destroy();
      this.__service.subservices.remove(sinkinstancename);
      return q(true);
    }
    return q(true); //what else?
  };
  ServiceUser.prototype._onSinkAcquired = function(defer,record,sink){
    var sinkinstancename = this._instanceNameFromRecord(record);
    if(sinkinstancename){
      var q = this.__service.subservices.replace(sinkinstancename,sink);
      while (q.getFifoLength()) {
        q.pop().resolve(sink);
      }
      q.destroy();
      sink.destroyed.attachForSingleShot(this.__service._onSubServiceDown.bind(this.__service,sinkinstancename,record));
    }
    this.__service.data.create(record).done(
      this._onServiceRecordCreated.bind(this,defer,sink),
      defer.reject.bind(defer)
    );
  };
  ServiceUser.prototype._onServiceRecordCreated = function(defer,sink,record){
    //sink.consumeChannel('s',sink.extendTo(this.__service.data.stateStreamFilterForRecord(record))); //extendTo might be an overkill here?
    var state = taskRegistry.run('materializeState',{
      sink: sink
    });
    this._onSubServiceState(state,record);
    defer.resolve(sink);
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
