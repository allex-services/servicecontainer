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
