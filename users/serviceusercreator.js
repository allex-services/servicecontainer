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
  ServiceUser.prototype.spawn = function(instancename,modulename,prophash,strategieshash,defer){
    console.log('ServiceContainer should spawn',instancename,modulename);
    var d = q.defer();
    this.acquireSink(instancename,modulename,prophash,strategieshash,d);
    d.promise.done(
      this._onSinkAcquired.bind(this,defer,{
        instancename:instancename,
        modulename:modulename,
        prophash:prophash,
        strategies:strategieshash,
        closed:false
      }),
      defer.reject.bind(defer)
    );
  };
  ServiceUser.prototype._onSinkAcquired = function(defer,record,sink){
    console.log('sink acquired',sink);
    sink.consumeChannel('s',function(item){
      console.log('sub-sink state',item);
    });
    this.__service.data.create(record);
  };

  return ServiceUser;
}

module.exports = createServiceUser;
