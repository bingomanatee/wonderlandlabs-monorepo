import { PromiseQueue } from "../lib";
import { delay } from "../testUtils";
import { PromiseQueueEvent } from "../src/types";

type PQTest = (pq: PromiseQueue, events: PromiseQueueEvent[]) => any;
function pq(test: PQTest) {
  return () => {
    const emitted: PromiseQueueEvent[] = [];

    const pq = new PromiseQueue();

    pq.events.subscribe((e: PromiseQueueEvent) => emitted.push(e));
    return test(pq, emitted);
  };
}

describe("ProcessQueue", () => {
  it(
    "emits a value when complete",
    pq(async (pq: PromiseQueue, emitted: PromiseQueueEvent[]) => {
      expect(emitted).toEqual([]);
      const promise = delay(100, 200);
      pq.set("foo", promise);
      expect(emitted).toEqual([]);
      await promise;
      expect(emitted).toEqual([{ key: "foo", value: 100 }]);
    }),
  );

  it(
    "preempts incomplete promises",
    pq(async (pq, events) => {
      const promise1 = delay(100, 1000);
      const promise2 = delay(200, 500);
      const promise3 = delay(300, 250);
      pq.set("foo", promise1);
      pq.set("foo", promise2);
      pq.set("foo", promise3);
      await Promise.all([promise3, promise1, promise2]);

      expect(events).toEqual([{ key: "foo", value: 300 }]);
    }),
  );
});
