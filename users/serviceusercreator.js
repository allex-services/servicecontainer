function createServiceUser(execlib,ParentUser){

  var lib = execlib.lib,
      q = lib.q;

  if(!ParentUser){
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  function ServiceUser(prophash){
    ParentUser.call(this,prophash);
  }
  ParentUser.inherit(ServiceUser,require('../methoddescriptors/serviceuser'),require('../visiblefields/serviceuser'));
  ServiceUser.prototype.__cleanUp = function(){
    ParentUser.prototype.__cleanUp.call(this);
  };
  ServiceUser.prototype.spawn = function(spawndescriptor,defer){
    console.log('spawn!',spawndescriptor);
    var d = q.defer();
    this.acquireSink(spawndescriptor,d);
    d.promise.done(
      this._onSinkAcquired.bind(this,defer,spawndescriptor),
      defer.reject.bind(defer)
    );
  };
  ServiceUser.prototype._onSinkAcquired = function(defer,spawndescriptor,sink){
    var record = this._spawnDescriptorToRecord(spawndescriptor);
    record.closed = false;
    this.__service.data.create(record).done(
      this._onServiceRecordCreated.bind(this,defer,sink),
      defer.reject.bind(defer)
    );
  };
  ServiceUser.prototype._onServiceRecordCreated = function(defer,sink,record){
    sink.consumeChannel('s',sink.extendTo(this.__service.data.stateStreamFilterForRecord(record)));
    defer.resolve(record);
  };
  ServiceUser.prototype._spawnDescriptorToRecord = function(spawndescriptor){
    return spawndescriptor;
  };

  return ServiceUser;
}

module.exports = createServiceUser;
