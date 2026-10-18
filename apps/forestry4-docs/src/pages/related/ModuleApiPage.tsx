import { useEffect } from 'react';
import { Container, HStack, Link, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';
import Section from '../../components/Section';
import ModuleSections, { sectionId } from './ModuleSections';
import { relatedModules, relatedPath, type RelatedModule } from './modules';
import { moduleApiSections } from './api';
import { moduleApiPath } from './api/shared';

export default function ModuleApiPage({
  module,
}: {
  module: RelatedModule;
}) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [module.slug]);
  const sections = moduleApiSections[module.slug];

  return (
    <Container maxW="container.xl" py={8}>
      <Link as={RouterLink} to={relatedPath(module)}>
        {module.title} guide
      </Link>
      <PageTitle
        title={`${module.title} API`}
        subtitle={module.packageName}
      />
      <VStack layerStyle="section" spacing={8}>
        <Section title="On this page">
          <HStack spacing={4} flexWrap="wrap">
            {sections.map((section) => (
              <Link key={section.title} href={`#${sectionId(section.title)}`}>
                {section.title}
              </Link>
            ))}
          </HStack>
        </Section>
        <ModuleSections sections={sections} />
        <Section title="Related API references">
          {relatedModules
            .filter((other) => other.slug !== module.slug)
            .map((other) => (
              <Link
                key={other.slug}
                as={RouterLink}
                to={moduleApiPath(other.slug)}
              >
                {other.title} API
              </Link>
            ))}
        </Section>
      </VStack>
    </Container>
  );
}
