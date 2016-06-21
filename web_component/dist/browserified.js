(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
ALLEX.execSuite.registry.registerClientSide('allex_servicecontainerservice',require('./sinkmapcreator')(ALLEX, ALLEX.execSuite.registry.getClientSide('allex_dataservice')));

},{"./sinkmapcreator":4}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
module.exports = {
};

},{}],4:[function(require,module,exports){
function sinkMapCreator(execlib,ParentSinkMap){
  'use strict';
  var sinkmap = new (execlib.lib.Map);
  sinkmap.add('service',require('./sinks/servicesinkcreator')(execlib,ParentSinkMap.get('service')));
  sinkmap.add('user',require('./sinks/usersinkcreator')(execlib,ParentSinkMap.get('user')));
  
  return sinkmap;
}

module.exports = sinkMapCreator;

},{"./sinks/servicesinkcreator":5,"./sinks/usersinkcreator":6}],5:[function(require,module,exports){
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

},{"../methoddescriptors/serviceuser":2,"../storagedescriptor":7,"../visiblefields/serviceuser":8}],6:[function(require,module,exports){
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

},{"../methoddescriptors/user":3,"../storagedescriptor":7,"../visiblefields/user":9}],7:[function(require,module,exports){
module.exports = {
  record:{
    fields:[
    ]
  }
};

},{}],8:[function(require,module,exports){
module.exports = [
  'instancename',
  'modulename',
  'propertyhash',
  'strategies',
  'closed'
];

},{}],9:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}]},{},[1]);
