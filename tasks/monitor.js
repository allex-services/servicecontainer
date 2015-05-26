function createMonitor(execlib){
  var lib = execlib.lib,
      q = lib.q,
      execSuite = execlib.execSuite,
      SinkTask = execSuite.SinkTask,
      taskRegistry = execSuite.taskRegistry;
  function SubServiceMonitor(prophash){
    SinkTask.call(this,prophash);
    this.sink = prophash.sink;
    this.services = [];
    this.newServiceEvent = new lib.HookCollection();
    this.serviceDownEvent = new lib.HookCollection();
    taskRegistry.run('materializeData',{
      sink: this.sink,
      data: this.services,
      onNewRecord: this.onNewService.bind(this),
      onRecordDeletion: this.onServiceDown.bind(this)
    });
  }
  lib.inherit(SubServiceMonitor,SinkTask);
  SubServiceMonitor.prototype.__cleanUp = function(){
    if(!this.serviceDownEvent){
      return;
    }
    this.serviceDownEvent.destruct();
    this.serviceDownEvent = null;
    this.newServiceEvent.destruct();
    this.newServiceEvent = null;
    this.services = null;
    SinkTask.prototype.__cleanUp.call(this);
  };
  SubServiceMonitor.prototype.go = function(){
  };
  SubServiceMonitor.prototype.onNewService = function(servicerecord){
    this.log('new service',servicerecord);
    this.newServiceEvent.fire(servicerecord);
  };
  SubServiceMonitor.prototype.onServiceDown = function(servicerecord){
    this.log('service down',servicerecord);
    this.serviceDownEvent.fire(servicerecord);
  };
  SubServiceMonitor.prototype.compulsoryConstructionProperties = ['sink'];
  return SubServiceMonitor;
}

module.exports = createMonitor;
