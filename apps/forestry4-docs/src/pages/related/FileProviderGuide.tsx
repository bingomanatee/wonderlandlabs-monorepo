import { Text } from '@chakra-ui/react';
import Section from '../../components/Section';
import CodePanel from '../../components/CodePanel';

export default function FileProviderGuide() {
  return (
    <>
      <Section
        title="Store files behind one interface"
        id="store-files-behind-one-interface"
        scrollMarginTop="80px"
      >
        <Text>
          FileProvider is an independent companion utility: it does not depend
          on Forestry 4. Applications can use it for assets and exports
          alongside Forestry state and DataCore records.
        </Text>
        <Text>
          The package root exports LocalFileIoProvider, KeyValueFileIoProvider,
          RestFileIoProvider, S3FileIoProvider, MockFileIoProvider, and shared
          FileIoProvider types. The current root entry includes Node filesystem,
          networking, and crypto modules; use it in Node services or build
          tools.
        </Text>
        <CodePanel
          language="typescript"
          content={`import {
  LocalFileIoProvider,
} from '@timothyopensource/fileprovider';

const files = new LocalFileIoProvider({ root: './data/files' });
await files.write('drafts/one.md', '# Chapter One');
const file = await files.read('drafts/one.md');
console.log(new TextDecoder().decode(file.value));
console.log(file.mediaType, file.storedAt);`}
        />
      </Section>
      <Section
        title="Choose a provider"
        id="choose-a-provider"
        scrollMarginTop="80px"
      >
        <Text>
          LocalFileIoProvider takes &#123; root &#125; for files on disk.
          MockFileIoProvider stores files in memory and exposes calls and
          readStoredText for tests. KeyValueFileIoProvider takes &#123; url,
          keyPrefix? &#125; for Redis/Valkey-compatible storage.
        </Text>
        <Text>
          RestFileIoProvider takes &#123; urlPrefix, fetch, headers?,
          defaultWriteMethod? &#125;. It supports reads, existence checks, and
          writes; delete, move, search, and transforms are unsupported. The
          write method defaults to PUT. Prefixes may also be local paths or file
          URLs, which do not require fetch.
        </Text>
        <Text>
          S3FileIoProvider takes bucket, region, accessKeyId, secretAccessKey,
          and injected fetch. Optional endpoint, forcePathStyle, and
          sessionToken support compatible services and temporary credentials. It
          signs requests with AWS Signature Version 4. Keep credentials in
          server configuration.
        </Text>
        <Text>
          REST and S3 resolve the injected fetch for requests rather than
          falling back to global fetch. Select the provider at the application
          boundary and depend on FileIoProvider elsewhere.
        </Text>
      </Section>
      <Section
        title="Promises, streams, and batches"
        id="promises-streams-and-batches"
        scrollMarginTop="80px"
      >
        <Text>
          read and write return promises; failed responses reject with the
          response error. readMany and writeMany return maps keyed by storedAt.
          hasAll resolves true only when every path exists.
        </Text>
        <Text>
          get, put, getMany, putMany, has, hasMany, delete, deleteMany, move,
          search, map, and maps return RxJS response streams. Each emission is
          an array; inspect response.ok before reading output, and handle both
          failed responses and observable errors.
        </Text>
        <Text>
          Batch paths and write inputs support nested arrays. inputStream().next
          accepts one write or nested writes and returns a response stream
          scoped to that commission. Call complete on the input stream when
          finished.
        </Text>
        <CodePanel
          language="typescript"
          content={`import {
  MockFileIoProvider,
} from '@timothyopensource/fileprovider';

const files = new MockFileIoProvider();
await files.writeMany(
  { path: 'one.md', value: '# One' },
  [{ path: 'two.md', value: '# Two' }],
);
const allPresent = await files.hasAll('one.md', ['two.md']);
console.log(allPresent, files.readStoredText('one.md'));`}
        />
      </Section>
      <Section
        title="Data, results, and transforms"
        id="data-results-and-transforms"
        scrollMarginTop="80px"
      >
        <Text>
          Writes accept strings, array buffers, buffer views, or data objects.
          Reads normalize value to Uint8Array. FileIoData includes storedAt,
          name, and mediaType; media type is detected unless supplied.
        </Text>
        <Text>
          FileIoWriteResult includes byteSize, contentHash (SHA-256 hex),
          mediaType, name, storedAt, and writtenAt. Stream responses include
          request id, input, ok, output, and error.
        </Text>
        <Text>
          map transforms one path; maps transforms a glob selection. Callbacks
          return a delta: in lists files to remove and out lists files to write.
          map defaults in to its source file. Local, key-value, S3, and mock
          providers support transforms.
        </Text>
      </Section>
    </>
  );
}
