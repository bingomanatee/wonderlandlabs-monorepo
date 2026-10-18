import { useEffect } from 'react';
import {
  Code,
  Container,
  Link,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import CodePanel from '../../components/CodePanel';
import PageTitle from '../../components/PageTitle';
import DataCoreGuide from './DataCoreGuide';
import ConnectionsGuide from './ConnectionsGuide';
import ReactHooksGuide from './ReactHooksGuide';
import FileProviderGuide from './FileProviderGuide';
import { moduleApiPath } from './api/shared';
import Section from '../../components/Section';
import { readWritePath } from './ReadWriteArchitecture';
import {
  relatedModules,
  relatedPath,
  relatedRoot,
  type RelatedModule,
} from './modules';

export function RelatedModules() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <Container maxW="container.xl" py={8}>
      <PageTitle
        title="Related Modules"
        subtitle="Forestry 4 and its companion modules."
      />
      <VStack layerStyle="section" spacing={8}>
        <Section title="Choose what your application needs">
          <Text>
            Start with Forestry 4, the core state manager. DataCore and
            React Hooks build on its stores and branches. Data Connections
            and FileProvider can also be used independently. Install the
            companion packages as your application needs them.
          </Text>
          {relatedModules.map((module) => (
            <Text key={module.slug}>
              <Link
                as={RouterLink}
                to={relatedPath(module)}
                fontWeight="semibold"
              >
                {module.title}
              </Link>
              {': '}{module.summary}{' '}
              <Code>{module.packageName}</Code>{' · '}
              <Link
                as={RouterLink}
                to={moduleApiPath(module.slug)}
                aria-label={`${module.title} API`}
              >
                API
              </Link>
            </Text>
          ))}
        </Section>
        <Section title="How they fit together">
          <Text>
            Keep application state in Forestry stores. DataCore adds keyed,
            validated record collections; its connection layer supplies
            explicit data I/O and fallback. React Hooks subscribes components
            to stores. FileProvider handles files and assets through a
            separate storage interface.
          </Text>
          <Text>
            Record synchronization and persistence policies belong to your
            application. Adding a connection or a file provider does not
            automatically save Forestry state.
          </Text>
        </Section>
      </VStack>
    </Container>
  );
}

export function RelatedModulePage({ module }: { module: RelatedModule }) {
  useEffect(() => { window.scrollTo(0, 0); }, [module.slug]);

  const install = module.slug === 'react-hooks'
    ? `${module.packageName} @wonderlandlabs/forestry4 react`
    : module.packageName === '@wonderlandlabs/forestry-data-core'
      ? `${module.packageName} @wonderlandlabs/forestry4 zod`
      : module.packageName;

  return (
    <Container maxW="container.xl" py={8}>
      <Link as={RouterLink} to={relatedRoot}>
        Related Modules
      </Link>
      <PageTitle title={module.title} subtitle={module.summary} />
      <Text mb={6}>
        <Link as={RouterLink} to={moduleApiPath(module.slug)}>
          {module.title} API reference
        </Link>
      </Text>
      {module.slug === 'data-core' && (
        <Text mb={6}>
          <Link as={RouterLink} to={readWritePath}>
            Architecture: single and double layer models
          </Link>
        </Text>
      )}
      <VStack layerStyle="section" spacing={8}>
        <Section title="Installation">
          <CodePanel
            key={install}
            language="shell"
            content={`npm install ${install}`}
          />
        </Section>
        {module.slug === 'data-core' && <DataCoreGuide />}
        {module.slug === 'connections' && <ConnectionsGuide />}
        {module.slug === 'react-hooks' && <ReactHooksGuide />}
        {module.slug === 'file-provider' && <FileProviderGuide />}
        <Section title="Explore related modules">
          {relatedModules
            .filter((other) => other.slug !== module.slug)
            .map((other) => (
              <Link
                key={other.slug}
                as={RouterLink}
                to={relatedPath(other)}
              >
                {other.title}
              </Link>
            ))}
        </Section>
      </VStack>
    </Container>
  );
}
