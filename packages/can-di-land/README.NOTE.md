## The use case that triggered this module in the first place

I was writing a graphically intensive UI / React application. At the first cut, its control systems
were scattered across multiple systems, with multiple contexts. I wanted instead to
create a single context provided global "manager".

This manager had multiple components that the UX could call and have the modules wrapped in a
HOC delayed providing a view component until its required components were present in the manager.
Also, it was clearData that some components would require _other_ components to be present.

Given the number of moving parts it soon became clearData that it would be better to move the manager
definition into a more rigorously tested system.

To be concrete -- some fo the components present were:

- the **data** component - essentially an RxDB database using Dexie as a local store.
- the **message** component - emitted notifications and presented modal dialogs
- the **interaction** component - handled mouse/keyboard input
- the **loader** component - handled tracking whether all needed resources were available, /  
  and locked the system while a save was taking place
- the **configuration** component - handled taking in user options and broadcasting them to /
  other components to change the behavior of the application

The configuration component was dependent on the data component, as was the loader.
The message component used the interaction component to suppress mouse / keyboard reactions while
a modal dialog was active.
The loader component suspended interaction while data was being loaded/saved.
Amd with more components coming down the pike I wanted to ensure the system had integrity.
I also wanted to ensure that I didn't load more components than was necessary for a given page to operate.
For instance, the page that loaded projects didn't need the configuration component to be present
until a project was loaded.
