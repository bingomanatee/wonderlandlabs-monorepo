import { Box, Code, Text } from '@chakra-ui/react';
import CodePanel from '../../components/CodePanel';
import Section from '../../components/Section';
import type { ModuleSection } from './modules';

export const sectionId = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');

export default function ModuleSections({
  sections,
}: {
  sections: ModuleSection[];
}) {
  return sections.map((section) => (
    <Section
      key={section.title}
      title={section.title}
      id={sectionId(section.title)}
      scrollMarginTop="80px"
    >
      {section.paragraphs.map((paragraph) => (
        <Text key={paragraph}>{paragraph}</Text>
      ))}
      {section.methods && (
        <Box as="dl" m={0}>
          {section.methods.map((method) => (
            <Box key={method.signature} mb={5} _last={{ mb: 0 }}>
              <Box as="dt" mb={2}>
                <Code whiteSpace="normal" overflowWrap="anywhere">
                  {method.signature}
                </Code>
              </Box>
              <Text as="dd" m={0}>{method.description}</Text>
            </Box>
          ))}
        </Box>
      )}
      {section.code && (
        <CodePanel
          language={section.language ?? 'typescript'}
          content={section.code}
        />
      )}
    </Section>
  ));
}
