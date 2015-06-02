# ServiceContainerService
This is a specialization of [DataService](../../../data)

## How it works
The `service` User has a `spawn` method.

Once you acquire a Sink to a `service` User, issue `sink.call('spawn',...)` in order to spawn a new sub-Service on the ServiceContainerService instance.

## You need to specialize
ServiceContainerService is an _abstract_ service. It provides no means to actually spawn a sub-Service.

However, it has all the methods to handle a sink to a newly instantiated sub-Service:

- the new sink will be put in the `subservices` map of the ServiceContainerService instance
- a new record describing the new sub-Service will be created in the ServiceContainerService data
- the record that describes the sub-Service will be updated whenever the sub-Service instance changes its state (provided that the state field is related to the Record of the ServiceContainerService)

Therefore, one should follow the dataStream (the `'d'` Channel on the acquired Sink to ServiceContainerService) in order to obtain information on all contained sub-Services

## How to specialize

1. Inherit from `allex_dataservice`
2. Define a _storagedescriptor_ in `storagedescriptor.js` (especially the structure of the describing Record for data)
3. Write the `acquireSink` method on the `service` User (in `users/serviceusercreator.js`), because it will be called, but there is no generic implementation in ServiceContainerService.

## Further tweaks

1. All sub-Services will be mapped in the `subservices` according to the `instancename` field of the property hash provided to the `spawn` method of the `service` User. You can change this behavior by overriding the [_instanceNameFromRecord](users/serviceusercreator.js#L71) method of the `service` User.