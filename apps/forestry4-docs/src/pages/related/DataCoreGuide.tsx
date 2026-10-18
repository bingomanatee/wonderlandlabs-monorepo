import PendingIndicatorDemo from './PendingIndicatorDemo';
import { Text } from '@chakra-ui/react';
import Section from '../../components/Section';
import CodePanel from '../../components/CodePanel';

export default function DataCoreGuide() {
  return (
    <>
      <Section
        title="Install and create a collection"
        id="install-and-create-a-collection"
        scrollMarginTop="80px"
      >
        <Text>
          DataCore uses your application’s Forestry installation. Install the
          package alongside Forestry 4 and Zod.
        </Text>
        <Text>
          defineCollection infers records and string or numeric keys from a Zod
          object schema. Every write validates the full record; explicit keys
          must match its identity. Updates cannot change it.
        </Text>
        <CodePanel
          language="typescript"
          content={`import { z } from 'zod';
import {
  DataManager,
  defineCollection,
} from '@wonderlandlabs/forestry-data-core';

const bookSchema = z.object({
  id: z.number().int().nonnegative(),
  title: z.string().min(1),
});
const Books = defineCollection(bookSchema, 'id');
const data = new DataManager();
const books = data.addModel('books', Books);

books.setItem({ id: 0, title: 'The Dispossessed' });
books.update(0, { title: 'The Left Hand of Darkness' });
console.log(books.getItem(0));`}
        />
      </Section>
      <Section
        title="Working with collection records"
        id="working-with-collection-records"
        scrollMarginTop="80px"
      >
        <Text>
          Load existing records with setMany or putMany, then use setItem or put
          for complete record writes and update for partial edits. Bulk loads
          merge into the collection; they do not remove records that are missing
          from the incoming data. Use cleanAll first when you deliberately want
          to replace the entire local cache.
        </Text>
        <Text>
          Use getItem to read one record by identity, has to check its presence,
          and list to work with all records in insertion order. The inherited
          get reads Forestry state paths, so use it for state such as the
          records Map rather than identity lookups.
        </Text>
        <Text>
          Keep the collection returned by addModel so its custom utilities
          remain inferred. Retrieve an existing collection through
          manager.collection when you only know its registered name. The API
          reference linked above lists signatures, return values, defaults, and
          validation behavior.
        </Text>
      </Section>
      <Section
        title="Finding records and cleaning the local cache"
        id="finding-records-and-cleaning-the-local-cache"
        scrollMarginTop="80px"
      >
        <Text>
          Use find with a partial example for exact field matches, an ID array
          when you already know the keys, or a filter function for
          application-specific queries. Pass a comparator when the result needs
          a different order. The result array is independent, but the records
          still belong to collection state; edit them through collection write
          methods.
        </Text>
        <Text>
          Use cleanCollection with the same query forms to evict local records.
          Prefer an ID array or a narrowly scoped filter when cleaning a cache;
          an empty example selects every record. Use cleanAll for a deliberate
          collection reset. Both discard the removed records’ pending tracking,
          so settle or intentionally abandon that work before cleaning.
        </Text>
        <Text>
          Local housekeeping does not delete server data. For a remote deletion,
          send the connector request explicitly and clean the local record after
          success, or retain your own retry information when removing
          optimistically. delete also accepts a single ID or the same queries as
          find for local removal. The example shows editing, tracking, and
          cleanup as one workflow.
        </Text>
      </Section>
      <Section
        title="Why collections track changes"
        id="why-collections-track-changes"
        scrollMarginTop="80px"
      >
        <Text>
          A collection can contain thousands of records loaded from a server
          while only a few have local edits. Tracking identifies records your
          application may need to save or otherwise process. It lets you build a
          pending-changes indicator or collect pending records without resending
          the entire collection. DataCore records the keys; your application
          decides what those keys mean and when work is complete.
        </Text>
        <Text>
          value.changed contains keys touched by tracked writes. value.created
          contains keys first inserted by a tracked write when that key was
          absent locally. Every created key is also changed. Editing that new
          record keeps it in both sets. Editing an existing record adds it to
          changed without newly adding it to created.
        </Text>
        <Text>
          Created describes local collection history, not server existence.
          Loading a record without tracking and later editing it makes it
          changed, not created. Your application must determine whether a remote
          create, update, or upsert is appropriate.
        </Text>
        <Text>
          These sets contain keys, not previous values, field-level patches, or
          an ordered event history. Writing the same value still marks its key
          changed; restoring an earlier value does not remove that key. Repeated
          writes collapse into one set entry. Tracking cannot undo edits, detect
          conflicts, or determine whether a server has saved them.
        </Text>
        <Text>
          Tracking belongs to collection write helpers. Arbitrary inherited
          Forest mutations do not automatically maintain these sets. Reads,
          including find, leave them alone. delete removes a record and its
          entries from both sets; it does not retain a pending-delete marker.
        </Text>
      </Section>
      <Section
        title="When to enable or disable tracking"
        id="when-to-enable-or-disable-tracking"
        scrollMarginTop="80px"
      >
        <Text>
          Keep the defaults for the common workflow: setItem, put, and update
          track single-record edits; setMany, putMany, and addModel starter data
          load records without tracking. The final boolean argument on
          collection write methods overrides that default for that call only.
          There is no collection-wide tracking switch.
        </Text>
        <Text>
          Pass true to setMany or putMany for a user-created import, bulk edit,
          or generated records that still need saving. Bulk methods default to
          false because they also hydrate collections; explicitly enable
          tracking when the batch represents new pending application work.
        </Text>
        <Text>
          Pass false to setItem, put, or update when applying an authoritative
          server load, a socket update, or an already-saved server response.
          This avoids treating inbound data as a new outbound edit. It is also
          reasonable for local-only data that your application intentionally
          excludes from pending-change processing.
        </Text>
        <Text>
          Do not disable tracking for a user edit that your save workflow
          expects to discover through changed. Conversely, tracking a server
          refresh can unnecessarily queue records for saving again. Choose based
          on the origin and purpose of the write, not its size.
        </Text>
        <Text>
          False means do not add tracking entries; it does not mark an already
          dirty record clean or cancel its pending work. An untracked write can
          still replace a dirty record’s contents, so reconcile inbound data
          before overwriting local edits. Tracking supplies no merge policy.
        </Text>
        <Text>
          False also does not skip schema validation, freeze the record, or
          suppress Forestry state updates and subscriptions. Use it to control
          pending-work bookkeeping, not to silence the interface.
        </Text>
      </Section>
      <Section
        title="Handling and clearing pending changes"
        id="handling-and-clearing-pending-changes"
        scrollMarginTop="80px"
      >
        <Text>
          Use collection.find([...collection.value.changed]) to obtain the
          current records for pending keys. value.created can help classify
          local inserts, but the connector contract does not prescribe separate
          create and update operations. Saving is explicit; connector calls
          never acknowledge collection tracking automatically.
        </Text>
        <Text>
          Tracking properties are read-only sets for inspection with has, size
          and iteration. Collection commands maintain them; there is no direct
          tracking reset. Use persist to acknowledge successful saves without
          clearing newer edits. Failed saves retain pending work.
        </Text>
        <Text>
          Use syncRecords(remoteMap) for inbound data that should preserve local
          edits. Pass true to accept the incoming records as authoritative and
          clear tracking for those IDs. Unmentioned IDs remain unchanged.
        </Text>
        <Text>
          For cache eviction or housekeeping, use cleanCollection(query) with
          the same query forms as find. It removes matching local records and
          their tracking entries. cleanAll empties this collection’s records and
          tracking sets while preserving its registration and methods. Neither
          operation contacts a connector. Both discard any pending work for the
          removed records.
        </Text>
        <Text>
          delete accepts a single ID or any find query and also removes only
          local data. To delete remotely, explicitly call connector.delete and
          clean the local record after success, or manage optimistic removal and
          retry information in your application. There is no deleted tracking
          set.
        </Text>
        <Text>
          Coordinate remote deletes separately. Removing a locally tracked
          record also removes its pending entries, so changed is not a complete
          remote synchronization queue. Tracking is optional bookkeeping for
          your workflow, rather than an automatic persistence system.
        </Text>
      </Section>
      <Section
        title="Example: distinguish inbound data from pending edits"
        id="example-distinguish-inbound-data-from-pending-edits"
        scrollMarginTop="80px"
      >
        <Text>
          Using the Books class from the earlier example, this shows the same
          collection receiving server data and accumulating local work. No
          connector request is made here.
        </Text>
        <CodePanel
          language="typescript"
          content={`const trackingManager = new DataManager();
const trackingBooks = trackingManager.addModel('tracking', Books);

// Server hydration is already authoritative: bulk loads default to false.
trackingBooks.setMany([{ id: 1, title: 'Loaded from server' }]);
console.log(trackingBooks.value.changed.size); // 0

// User edits use the default true; a new local key enters both sets.
trackingBooks.update(1, { title: 'Edited locally' });
trackingBooks.setItem({ id: 2, title: 'New local draft' });

// A user import is pending work, so override the bulk default with true.
trackingBooks.putMany([
  { id: 3, title: 'Imported draft' },
  { id: 4, title: 'Another imported draft' },
], true);
console.log([...trackingBooks.value.created]); // [2, 3, 4]
console.log([...trackingBooks.value.changed]); // [1, 2, 3, 4]

// An inbound record should not become a new outbound edit.
trackingBooks.setItem({ id: 5, title: 'Socket update' }, false);
console.log(trackingBooks.value.changed.has(5)); // false

// False does not acknowledge a record that is already dirty.
trackingBooks.put(2, { id: 2, title: 'Normalized local draft' }, false);
console.log(trackingBooks.value.created.has(2)); // true
console.log(trackingBooks.value.changed.has(2)); // true

const pendingBooks = trackingBooks.find([...trackingBooks.value.changed]);
console.log(pendingBooks.map((book) => book.id)); // [1, 2, 3, 4]
// Use persist({ sendRecords }) to send and acknowledge safely.
// Failed saves retain tracking. This example leaves the edits pending.`}
        />
      </Section>
      <Section
        title="Reconciling server echoes without redundant updates"
        id="reconciling-server-echoes-without-redundant-updates"
        scrollMarginTop="80px"
      >
        <Text>
          Configure recordComparator(current, incoming) to return true when two
          records represent equivalent content. syncRecords keeps the existing
          record reference for equivalent input and emits no update when nothing
          else changes. Schema validation still runs first. Without a
          comparator, equality uses Object.is.
        </Text>
        <Text>
          For timestamped records, compare every meaningful field and allow a
          small, explicit updatedAt tolerance. This example uses numeric Unix
          milliseconds and a five-second window. Equivalent echoes retain the
          local timestamp too. The comparator does not choose which conflicting
          record is newer or order server events.
        </Text>
        <Text>
          Dirty records remain protected by default. syncRecords(map, true)
          clears tracking for incoming IDs even when equivalent, preserving the
          existing reference. Persistence still uses strict snapshot identity to
          protect edits made during a save; this comparator only controls
          inbound synchronization.
        </Text>
        <CodePanel
          language="typescript"
          content={`const timestampedBookSchema = bookSchema.extend({
  updatedAt: z.number().finite(),
});
const echoToleranceMs = 5000;
const TimestampedBooks = defineCollection(timestampedBookSchema, 'id', {
  recordComparator: (current, incoming) =>
    current.id === incoming.id &&
    current.title === incoming.title &&
    Math.abs(current.updatedAt - incoming.updatedAt) <= echoToleranceMs,
});
const echoBooks = new DataManager().addModel('echoes', TimestampedBooks);
echoBooks.syncRecords(new Map([
  [1, { id: 1, title: 'Dune', updatedAt: 10000 }],
]));
const beforeEcho = echoBooks.getItem(1);
echoBooks.syncRecords(new Map([
  [1, { id: 1, title: 'Dune', updatedAt: 12000 }],
]));
console.log(echoBooks.getItem(1) === beforeEcho); // true`}
        />
      </Section>
      <Section
        title="Persisting without losing edits made during a save"
        id="persisting-without-losing-edits-made-during-a-save"
        scrollMarginTop="80px"
      >
        <Text>
          Use syncRecords(remoteMap) to merge remote data without tracking it.
          Local edited or created records survive. Pass true as its second
          argument to overwrite incoming IDs and clear their tracking. IDs
          absent from the map remain untouched. All entries validate first.
        </Text>
        <Text>
          Use abortPending(conflictingIds) to cancel older work that has not
          started. Omit IDs to cancel all older pending work. Active saves and
          failed requests awaiting retries continue normally. Local tracking is
          preserved; affected promises resolve false. Sync does not cancel
          persistence. Remote conflict checks still belong to the saving layer.
        </Text>
        <Text>
          Queued requests expose createdAt in Unix milliseconds and a state:
          pending, active, complete or failed. A retry remains failed while
          waiting and becomes active when sent again. Cancellation ends failed.
          Retain a request reference to inspect its final state after removal
          from the queues; completed requests are not stored as history.
        </Text>
        <Text>
          Use persist(&#123; ids?, sendRecords &#125;) instead of saving a
          snapshot and then clearing tracking manually. Without ids, select the
          current changed keys. Supply an ID array to save a subset or
          explicitly include untracked records. Missing records are omitted. An
          empty selection succeeds immediately without calling your sender.
        </Text>
        <Text>
          Each call copies its records with structuredClone and starts observing
          the collection immediately, even while other work is pending. Your
          async sendRecords receives an isolated Map&lt;Key, Item&gt; and
          returns true only when the whole supplied batch has succeeded. On
          success, persist removes created and changed entries only for records
          unchanged since their selected snapshot. Newer edits, including
          inbound untracked updates, remain pending. A true result means the
          send succeeded, not that the collection has no newer changes.
        </Text>
        <Text>
          Work is serialized. Requests queued before a batch starts are
          compacted when sendRecords is the exact same function reference. Their
          IDs are combined; for overlapping IDs, the latest queued snapshot
          wins. Keep the sender reference stable to enable compaction. Requests
          arriving during an active send form a later batch. Snapshots are
          captured at request time, not when that later batch starts.
        </Text>
        <Text>
          False results and thrown sender errors go to a delayed retry queue.
          The default is three retries after the first attempt, one second
          apart. Configure persistRetry: &#123; delayMs, maxRetries &#125; in
          defineCollection’s third argument or CollectionBaseConfig; maxRetries:
          0 disables retries. Exhausted requests resolve false and retain
          pending tracking. Retried sends receive fresh copies of the captured
          snapshots.
        </Text>
        <Text>
          Newer work for the same sender waits behind its delayed retries, then
          can compact with them. Other senders may proceed during that delay.
          This prevents an older retry overwriting a newer queued save through
          the same sender. Separate callback references are separate queues for
          this ordering rule; use a consistent callback for one remote target.
        </Text>
        <Text>
          Observe persistWork$ for active and queued requests, and persistRetry$
          for requests awaiting retry. Both start empty and contain normalized
          arguments, not record payloads. Call persist to enqueue work; treat
          these BehaviorSubjects as inspection streams rather than mutating
          them.
        </Text>
        <Text>
          Collection completion cancels retry timers, releases subscriptions,
          and resolves unfinished work false. It cannot abort network I/O
          already started by your callback; late success is ignored. cleanAll
          and cleanCollection do not cancel requested sends. Remote operations
          should be idempotent because retrying after a lost acknowledgement can
          repeat a successful write. Invalid IDs or uncloneable records reject
          the persist promise before enqueueing.
        </Text>
        <CodePanel
          language="typescript"
          content={`const syncManager = new DataManager();
const syncBooks = syncManager.addModel('sync', Books);
syncBooks.setMany([
  { id: 1, title: 'Before save' },
  { id: 2, title: 'Unchanged during save' },
], true);

// This controllable sender stands in for your async network request.
let finishSend!: (success: boolean) => void;
let signalStarted!: () => void;
const started = new Promise<void>((resolve) => { signalStarted = resolve; });
const sendRecords = async (
  snapshot: Map<number, z.output<typeof bookSchema>>,
): Promise<boolean> => {
  console.log(snapshot.get(1)?.title); // Before save
  signalStarted();
  return new Promise<boolean>((resolve) => { finishSend = resolve; });
};

const saving = syncBooks.persist({ sendRecords });
await started;
syncBooks.update(1, { title: 'Edited while saving' });
finishSend(true);
console.log(await saving); // true
console.log([...syncBooks.value.changed]); // [1]
console.log([...syncBooks.value.created]); // [1]
// Record 2 was acknowledged; the newer edit to record 1 is still pending.
// Tracking is acknowledged by persist.

const RetryingBooks = defineCollection(bookSchema, 'id', {
  persistRetry: { delayMs: 500, maxRetries: 2 },
});`}
        />
      </Section>
      <Section
        title="Example: load, edit, inspect, and persist"
        id="example-load-edit-inspect-and-persist"
        scrollMarginTop="80px"
      >
        <Text>
          This continues with the Books class and bookSchema defined above.
          Starter and bulk-loaded records begin untracked. Tracked edits then
          accumulate keys until explicitly cleared.
        </Text>
        <CodePanel
          language="typescript"
          content={`const catalog = new DataManager();
const catalogBooks = catalog.addModel('catalog', Books, new Map([
  [1, { id: 1, title: 'The Dispossessed' }],
]));
const registered = catalog.collection<
  z.output<typeof bookSchema>,
  number
>('catalog');
console.log(registered === catalogBooks); // true

// Bulk loads merge records without tracking by default.
catalogBooks.setMany([
  { id: 2, title: 'A Wizard of Earthsea' },
  { id: 3, title: 'The Tombs of Atuan' },
]);
catalogBooks.putMany(new Map([
  [4, { id: 4, title: 'The Farthest Shore' }],
]));
console.log(catalogBooks.value.changed.size); // 0

// An iterable can opt into tracking with the final argument.
catalogBooks.putMany([{ id: 5, title: 'Tehanu' }], true);
catalogBooks.setItem({ id: 6, title: 'The Other Wind' });
catalogBooks.put(7, { id: 7, title: 'Lavinia' });
catalogBooks.update(1, { title: 'The Dispossessed: revised' });
catalogBooks.update(999, { title: 'Missing' }); // No-op.

// Untracked replacements preserve already-pending tracking entries.
catalogBooks.setItem({ id: 6, title: 'The Other Wind: revised' }, false);
console.log([...catalogBooks.value.created]); // [5, 6, 7]
console.log([...catalogBooks.value.changed]); // [5, 6, 7, 1]

const first = catalogBooks.getItem(1);
console.log(first?.title); // The Dispossessed: revised
if (first) console.log(catalogBooks.keyOf(first)); // 1
console.log(catalogBooks.has(2)); // true
console.log(catalogBooks.list().map((book) => book.id));
// [1, 2, 3, 4, 5, 6, 7]
console.log(catalogBooks.get('records').size); // 7

// Find by example, by IDs, or by predicate with an optional sort.
console.log(catalogBooks.find({ title: 'Tehanu' })
  .map((book) => book.id)); // [5]
console.log(catalogBooks.find([4, 999, 1])
  .map((book) => book.id)); // [4, 1]
console.log(catalogBooks.find(
  (book) => book.id >= 5,
  (left, right) => right.id - left.id,
).map((book) => book.id)); // [7, 6, 5]

// Delete accepts queries too; a single ID remains supported.
// These equivalent calls are alternatives, not additional remote work:
// catalogBooks.delete([7]);
// catalogBooks.delete({ title: 'Lavinia' });
catalogBooks.delete((book) => book.id === 7);
console.log(catalogBooks.has(7)); // false
console.log([...catalogBooks.value.created]); // [5, 6]
console.log([...catalogBooks.value.changed]); // [5, 6, 1]

// The callback stands in for an application save request.
await catalogBooks.persist({ sendRecords: async () => true });
console.log(catalogBooks.value.created.size); // 0
console.log(catalogBooks.value.changed.size); // 0
console.log(catalogBooks.list().length); // 6 (records are preserved)

// Housekeeping affects local records only, with the same queries as find.
catalogBooks.cleanCollection([2]);
catalogBooks.cleanCollection({ title: 'Tehanu' });
catalogBooks.cleanCollection((book) => book.id > 3);
console.log(catalogBooks.list().map((book) => book.id)); // [1, 3]
catalogBooks.cleanAll();
console.log(catalogBooks.list().length); // 0 (collection remains reusable)`}
        />
      </Section>
      <Section
        title="Showing pending saves"
        id="showing-pending-saves"
        scrollMarginTop="80px"
      >
        <Text>
          Use the standalone JavaScript pending indicator to show your users
          that changes still need saving and the page should stay open.
          It uses the supplied icon in the lower right corner. It starts
          hidden; your app decides when to show and hide it. Failed saves
          should keep it visible until the records are saved or discarded.
        </Text>
        <Text>
          scale multiplies the original 64px size: 0.5 gives a 32px icon.
          speed is turns per second; 1 is one full turn per second and 0
          pauses it. Both options can be passed as a plain JSON object.
          Reduced-motion preferences show a still icon. The indicator has
          no React, Forestry or RxJS runtime dependency and does not save
          data, block closing the page or install an exit warning.
        </Text>
        <CodePanel
          language="javascript"
          content={`import {
  createPendingIndicator,
} from '@wonderlandlabs/forestry-data-core/pending-indicator';

const indicator = createPendingIndicator({ scale: 0.5, speed: 1 });
indicator.setPending(3); // Three records still need saving.
indicator.configure({ scale: 0.75, speed: 0.5, hue: 210 });
// Hide only after all pending work is saved or deliberately discarded.
indicator.setPending(0);
// Remove when the app or owning component is disposed.
indicator.destroy();`}
        />
        <Text>
          The number in the middle counts unsaved records and stays still
          while the icon spins. Count each record once, including edits
          waiting for a debounce timer, active saves and failed requests.
          Each preview picks a random size and hue, and shows three records
          for three seconds. The spinner’s two parts use 85% and 15% lightness
          for visibility on light and dark backgrounds. In an app, hide it
          only when all pending work is saved or discarded.
        </Text>
        <PendingIndicatorDemo />
      </Section>
      <Section
        title="Custom record and collection utilities"
        id="custom-record-and-collection-utilities"
        scrollMarginTop="80px"
      >
        <Text>
          Pass recordMethods and collectionMethods in the third argument to
          defineCollection. Their namespaces preserve Forestry method names.
          Utilities retain their owning collection when detached.
        </Text>
        <Text>
          Record callbacks receive (id, config, collection); collection
          callbacks receive (config, collection). Callers can omit config.
          Return types, promises, and errors are preserved. Keep standalone
          callbacks and configuration types in application specialty files.
        </Text>
        <CodePanel
          language="typescript"
          content={`const SearchableBooks = defineCollection(bookSchema, 'id', {
  recordMethods: {
    title: (id, _config, collection) =>
      collection.getItem(id)?.title,
  },
  collectionMethods: {
    titles: (_config, collection) =>
      collection.list().map((book) => book.title),
  },
});
const library = new DataManager();
const searchable = library.addModel('books', SearchableBooks);
searchable.setItem({ id: 0, title: 'The Dispossessed' });
console.log(searchable.recordMethods.title(0));
console.log(searchable.collectionMethods.titles());`}
        />
      </Section>
      <Section
        title="Connect collections to data sources"
        id="connect-collections-to-data-sources"
        scrollMarginTop="80px"
      >
        <Text>
          Supply connector or connections to DataManager when remote I/O is
          needed. Collection writes stay local. Explicitly load results with
          setMany, send pending records through the connector, and acknowledge
          tracking through persist after successful writes.
        </Text>
        <Text>
          Applications decide how connection change events update records. See
          Data Connections for standalone usage and transport contracts.
        </Text>
      </Section>
    </>
  );
}
