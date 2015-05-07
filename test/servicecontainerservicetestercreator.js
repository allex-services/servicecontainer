function createServiceContainerServiceTester(execlib,Tester){
  var lib = execlib.lib,
      q = lib.q;

  function ServiceContainerServiceTester(prophash,client){
    Tester.call(this,prophash,client);
    console.log('runNext finish');
    lib.runNext(this.finish.bind(this,0));
  }
  lib.inherit(ServiceContainerServiceTester,Tester);

  return ServiceContainerServiceTester;
}

module.exports = createServiceContainerServiceTester;
