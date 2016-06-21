function createServicePack(execlib){
  'use strict';

  return {
    service: {
      dependencies: ['allex:data']
    },
    sinkmap: {
      dependencies: ['allex:data']
    },
    tasks: {
      dependencies: []
    }
  };
}

module.exports = createServicePack;
