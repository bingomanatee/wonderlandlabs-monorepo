import { Box, Text } from '@chakra-ui/react';
import CodeTabs from '@/components/CodeTabs.tsx';
import Section from '@/components/Section.tsx';

export default function AdvancedFormDemoSource() {
  return (
    <Section title="Source Code">
      <Box>
        <Text color="gray.600" mb={4}>
          Here's how to implement advanced form validation using Forest branches with individual
          field state management:
        </Text>

        <CodeTabs
          tabs={[
            {
              label: 'Form Component',
              language: 'tsx',
              snippet: 'advancedFormComponent',
              folder: 'ValidationSystem',
            },
            {
              label: 'Field Branch Component',
              language: 'tsx',
              snippet: 'field-branch-component',
            },
            {
              label: 'Branch Configuration',
              language: 'typescript',
              snippet: 'usernameBranchConfig',
              folder: 'ValidationSystem',
            },
            {
              label: 'Form State Factory',
              language: 'typescript',
              snippet: 'formStateFactory',
              folder: 'ValidationSystem',
            },
          ]}
        />
      </Box>
    </Section>
  );
}
