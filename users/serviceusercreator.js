function createServiceUser(execlib,ParentUser){

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
    var d = q.defer();
    var record = this._spawnDescriptorToRecord(spawndescriptor);
    var sinkinstancename = this._instanceNameFromRecord(record);
    if(!sinkinstancename){
      defer.reject(new lib.Error('CANNOT_SPAWN_NAMELESS_SUBSERVICE'));
      return;
    }
    this.acquireSink(record,d);
    d.promise.done(
      this._onSinkAcquired.bind(this,defer,record),
      defer.reject.bind(defer)
    );
  };
  ServiceUser.prototype._onSinkAcquired = function(defer,record,sink){
    var sinkinstancename = this._instanceNameFromRecord(record);
    if(sinkinstancename){
      this.__service.subservices.add(sinkinstancename,sink);
      sink.destroyed.attachForSingleShot(this._onSubServiceDown.bind(this,sinkinstancename,record));
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
  ServiceUser.prototype._onSubServiceDown = function(sinkinstancename,record){
    this.__service.subservices.remove(sinkinstancename);
    this.__service.data.delete(filterFactory.createFromDescriptor({
      op:'eq',
      field:'instancename',
      d:sinkinstancename
    }));
  };
  ServiceUser.prototype._instanceNameFromRecord = function(record){
    return record.get('instancename');
  };
  ServiceUser.prototype._spawnDescriptorToRecord = function(spawndescriptor){
    var record = new (dataSuite.recordSuite.Record)(this.__service.storageDescriptor.record);
    return record.filterObject(spawndescriptor);
  };

  return ServiceUser;
}

module.exports = createServiceUser;
