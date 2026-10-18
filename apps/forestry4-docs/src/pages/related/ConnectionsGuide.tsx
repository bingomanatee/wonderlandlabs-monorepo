import { Text } from '@chakra-ui/react';
import Section from '../../components/Section';
import CodePanel from '../../components/CodePanel';

export default function ConnectionsGuide() {
  return (
    <>
      <Section
        title="Use connections independently"
        id="use-connections-independently"
        scrollMarginTop="80px"
      >
        <Text>
          The /connections entry point exports DataConnectionManager,
          JsonFixtureConnection, connectionStatus, createEmptyConnectionState,
          and their public types without loading Forestry classes. These are
          also package-root exports.
        </Text>
        <Text>
          This layer can be used without DataManager or collections. It lives in
          the DataCore package, so package installation still requires the
          declared Forestry peer dependency.
        </Text>
        <CodePanel
          language="typescript"
          content={`import {
  DataConnectionManager,
  JsonFixtureConnection,
} from '@wonderlandlabs/forestry-data-core/connections';

const fixtures = new JsonFixtureConnection({
  books: {
    first: { id: 'first', title: 'The Dispossessed' },
  },
});
const connection = new DataConnectionManager([fixtures]);
connection.start();
try {
  const books = await connection.get('books');
  console.log(books);
} finally {
  connection.stop();
}`}
        />
      </Section>
      <Section
        title="REST and socket contracts"
        id="rest-and-socket-contracts"
        scrollMarginTop="80px"
      >
        <Text>
          DataConnection requires async get, put, delete, and ensureReady, plus
          synchronous start and stop. Model names are strings; input and
          response shapes belong to the transport. Generic result types do not
          perform runtime validation.
        </Text>
        <Text>
          REST implementations can use no-op start and stop methods and omit
          state$ and changes$. Socket implementations can wait for readiness,
          perform request/response I/O, and publish pushed changes. The package
          provides contracts, not ready-made HTTP or WebSocket clients.
        </Text>
        <Text>
          DataStreamAdapter describes connect/disconnect and state/change
          streams. Wrap it with the full DataConnection contract before passing
          it to DataConnectionManager.
        </Text>
      </Section>
      <Section
        title="Fallback, streams, and cleanup"
        id="fallback-streams-and-cleanup"
        scrollMarginTop="80px"
      >
        <Text>
          For each operation, connections are tried in order. ensureReady runs
          first. Readiness or operation failures advance to the next connection;
          success returns immediately. If all fail, the last error is thrown. An
          empty list throws Data source failed.
        </Text>
        <Text>
          Fallback also applies to writes and deletes. Use idempotent operations
          or request identifiers when a lost response could cause a duplicate
          effect on retry.
        </Text>
        <Text>
          state$ starts at idle with null timestamps and an empty error. start
          subscribes to all available connection states; the latest emission
          wins. REST-only connections without state streams leave it idle.
          changes$ merges available streams for subscribers.
        </Text>
        <Text>
          start starts each connection once. Call stop once to release internal
          state subscriptions and stop every connection. A stopped manager
          cannot restart. Dispose application subscriptions too.
        </Text>
      </Section>
      <Section
        title="JSON fixtures"
        id="json-fixtures"
        scrollMarginTop="80px"
      >
        <Text>
          Fixtures use model-name maps containing records keyed by string id.
          get without an id returns all records; get and delete accept a string
          or an object with string id. put accepts a record or array. Numeric or
          custom identities need an application adapter.
        </Text>
        <Text>
          Input, writes, and reads are cloned. start reports connected; stop
          completes both streams. The fixture changes$ stream does not emit
          record-change events.
        </Text>
      </Section>
    </>
  );
}
