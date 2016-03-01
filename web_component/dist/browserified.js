(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ALLEX.execSuite.registry.add('allex_servicecontainerservice',require('./clientside')(ALLEX, ALLEX.execSuite.registry.get('allex_dataservice')));

},{"./clientside":2}],2:[function(require,module,exports){
function createClientSide(execlib, ParentServicePack){
  return {
    SinkMap: require('./sinkmapcreator')(execlib,ParentServicePack),
    Tasks: [{
      name: 'monitorSubServices',
      klass: require('./tasks/monitor')(execlib)
    }]
  };
}

module.exports = createClientSide;

},{"./sinkmapcreator":5,"./tasks/monitor":9}],3:[function(require,module,exports){
module.exports = {
  spawn: [{
    title: 'Spawn descriptor',
    type: 'object',
    properties: {
      instancename: {
        title: 'Instance name',
        type: 'string',
      },
      modulename: {
        title: 'Module name',
        type: 'string'
      },
      propertyhash: {
        title: 'Property hash',
        type: 'object'
      },
      strategies: {
        title: 'Strategies',
        type: 'object'
      }
    }
  }],
  kill: [{
    title: 'Instance name',
    type: 'string'
  }]
};

},{}],4:[function(require,module,exports){
module.exports = {
};

},{}],5:[function(require,module,exports){
function sinkMapCreator(execlib,ParentServicePack){
  'use strict';
  var sinkmap = new (execlib.lib.Map), ParentSinkMap = ParentServicePack.SinkMap;
  sinkmap.add('service',require('./sinks/servicesinkcreator')(execlib,ParentSinkMap.get('service')));
  sinkmap.add('user',require('./sinks/usersinkcreator')(execlib,ParentSinkMap.get('user')));
  
  return sinkmap;
}

module.exports = sinkMapCreator;

},{"./sinks/servicesinkcreator":6,"./sinks/usersinkcreator":7}],6:[function(require,module,exports){
function createServiceSink(execlib,ParentSink){
  'use strict';

  if(!ParentSink){
    ParentSink = execlib.execSuite.registry.get('.').SinkMap.get('user');
  }

  function ServiceSink(prophash,client){
    ParentSink.call(this,prophash,client);
  }
  ParentSink.inherit(ServiceSink,require('../methoddescriptors/serviceuser'),require('../visiblefields/serviceuser'),require('../storagedescriptor'));
  ServiceSink.prototype.__cleanUp = function(){
    ParentSink.prototype.__cleanUp.call(this);
  };
  return ServiceSink;
}

module.exports = createServiceSink;

},{"../methoddescriptors/serviceuser":3,"../storagedescriptor":8,"../visiblefields/serviceuser":10}],7:[function(require,module,exports){
function createUserSink(execlib,ParentSink){
  'use strict';

  if(!ParentSink){
    ParentSink = execlib.execSuite.registry.get('.').SinkMap.get('user');
  }

  function UserSink(prophash,client){
    ParentSink.call(this,prophash,client);
  }
  ParentSink.inherit(UserSink,require('../methoddescriptors/user'),require('../visiblefields/user'),require('../storagedescriptor'));
  UserSink.prototype.__cleanUp = function(){
    ParentSink.prototype.__cleanUp.call(this);
  };
  return UserSink;
}

module.exports = createUserSink;

},{"../methoddescriptors/user":4,"../storagedescriptor":8,"../visiblefields/user":11}],8:[function(require,module,exports){
module.exports = {
  record:{
    fields:[
    ]
  }
};

},{}],9:[function(require,module,exports){
function createMonitor(execlib){
  'use strict';
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

},{}],10:[function(require,module,exports){
module.exports = [
  'instancename',
  'modulename',
  'propertyhash',
  'strategies',
  'closed'
];

},{}],11:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"dup":10}]},{},[1]);
