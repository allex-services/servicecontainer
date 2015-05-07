function createServiceContainerUserTester(execlib,Tester){
  var lib = execlib.lib,
      q = lib.q;

  function ServiceContainerUserTester(prophash,client){
    Tester.call(this,prophash,client);
    console.log('runNext finish');
    lib.runNext(this.finish.bind(this,0));
  }
  lib.inherit(ServiceContainerUserTester,Tester);

  return ServiceContainerUserTester;
}

module.exports = createServiceContainerUserTester;
