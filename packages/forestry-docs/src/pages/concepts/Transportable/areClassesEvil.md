## Aren't classes evil?

No they are not. relying on deep inheritance and over reliance on intelligent properties may be
unhealthy but as a cluster of behaviors and methods with a known ecosystem of values is not an
inherently unhealthy pattern.

<SeeMore title="A more Detailed Breakdown">
The Functional Programming pattern has problems with classes because of:

1. polymoprhism - depending on functions to "intelligently" work based on inherited behavior
2. immutability - values change in the referential tree without management
3. inheritance  - related to polymorphism, wierd "triangles" of multiple parent behaviors
4. purity/side effects

Forest's classes have very little inheritance and no overloading of methods. If you don't overload
methods, and essentially "add new batches of behavior" without overlap, you don't expose yourself
to inheritance and polymorphism.

Immutability and purity are solved by using [RxJS](https://rxjs.dev/guide/overview), a functional processing system, to manage
communication and stateful-ness. The objects in Forest are largely used to keep a journal of past
state in a stack and allow synchronous transactions and rollbacks. One of the problems with
functional patterns is it assumes there is never a scenario where you may want to "partly expose"
values, test them, and then commit them - you can't manage state in time like that if you don't
have an infrastructure that understands data and time.


Plenty of healthy systems rely on classes including RxDB, Firebase, Scala, C#,
Mapbox, Pixi, Three.js, and many, many more. Functional design is a good architecture, but it does
not always deliver everything that every use case demands. And the existence of a useful
architectural pattern doesn't eliminate the utility of other patterns of engineering.

</SeeMore>
