import { useEffect, useState } from "react";
import { fromEvent } from "rxjs";
import { debounceTime, map, startWith } from "rxjs/operators";

export const useWindowSizeWithRxJS = () => {
  const [forceUpdate, setForceUpdate] = useState(false); // This is the variable to trigger re-render

  useEffect(() => {
    // Create an observable from window resize events
    const resize$ = fromEvent(window, "resize").pipe(
      // Debounce the event to reduce the number of state updates
      debounceTime(100), // Adjust this value to control how often the size change is registered
      map(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
      })),
      startWith({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    );

    // Subscribe to the observable
    const subscription = resize$.subscribe(() => {
      setForceUpdate(true); // Set forceUpdate to true whenever the size changes

      // Automatically set forceUpdate back to false after a short delay
      setTimeout(() => setForceUpdate(false), 500); // Adjust delay as needed
    });

    // Clean up the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  return forceUpdate;
};
