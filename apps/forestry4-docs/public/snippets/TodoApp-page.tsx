// Auto-generated snippet from: apps/forestry4-docs/src/pages/examples/TodoApp.tsx
// Description: TodoApp example page component
// Last synced: Sat Sep 20 13:42:04 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import { Forest } from '@wonderlandlabs/forestry4';
import {
  Box,
  Collapse,
  Container,
  Heading,
  HStack,
  List,
  ListIcon,
  ListItem,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import TodoAppDemo from '@/components/ReactIntegration/TodoAppDemo';
import CodeTabs from '@/components/CodeTabs';
import PageTitle from '@/components/PageTitle';
import Section from '@/components/Section.tsx';
import useForestryLocal from '@/hooks/useForestryLocal.ts';
import { IoMdArrowDropright } from 'react-icons/io';
import { MdArrowDropDown } from 'react-icons/md';

type ShowValue = {
  show: boolean;
};

class ShowStore extends Forest<ShowValue> {
  constructor() {
    super({
      value: { show: false },
    });
  }

  toggle() {
    this.mutate((draft: ShowStore) => {
      draft.show = !draft.show;
    });
  }
}

function showStoreFactory() {
  return new ShowStore();
}

const ArchHead: React.FC = ({ store }: { store: StoreIF<ShowValue> }) => (
  <Heading variant="card" onClick={store.$.toggle} alignSelf="flex-start">
    <HStack gap="md">
      <Text size="lg">{store.value.show ? <MdArrowDropDown /> : <IoMdArrowDropright />}</Text>
      <Text>Architecture Highlights</Text>
    </HStack>
  </Heading>
);

const TodoApp: React.FC = () => {
  const [{ show }, showStore] = useForestryLocal<ShowValue>(showStoreFactory);
  return (
    <Container maxW="container.xl" py={8}>
      <PageTitle>Todo App example </PageTitle>
      <VStack layerStyle="section" spacing={8}>
        <Box textAlign="center">
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            The Classic ToDo app with compressed store structure in play.
          </Text>
        </Box>

        {/* Live Demo */}
        <Section title="Live Demo" titleSize="md">
          <Text mb={4} color="gray.600">
            Try the todo app below. Notice how all interactions are handled through store actions,
            and the component is purely presentational.
          </Text>
          <TodoAppDemo />
        </Section>

        {show ? null : <ArchHead store={showStore} />}
        <Collapse in={show}>
          <Section>
            <ArchHead store={showStore} />
            <Text textStyle="body">
              This example demonstrates the ultimate Forestry pattern where the React component is
              purely declarative JSX with zero business logic.
            </Text>

            <VStack spacing={4} align="stretch">
              <Box>
                <Heading variant="subtle">Pure Component Pattern</Heading>
                <Text fontSize="sm" color="gray.600">
                  The React component contains no business logic, state management, or event
                  handling code. Everything is delegated to store actions.
                </Text>
              </Box>

              <Box>
                <Heading size="sm" mb={2}>
                  Action Categories
                </Heading>
                <List spacing={1} fontSize="sm">
                  <ListItem>
                    <strong>Data Actions:</strong> addTodo, toggleTodo, removeTodo, setFilter,
                    clearCompleted
                  </ListItem>
                  <ListItem>
                    <strong>UI Actions:</strong> setFilterAll, setFilterActive, setFilterCompleted,
                    handleKeyPress
                  </ListItem>
                  <ListItem>
                    <strong>Selector Actions:</strong> filteredTodos, completedCount, activeCount,
                    isAddDisabled
                  </ListItem>
                  <ListItem>
                    <strong>Factory Actions:</strong> createToggleTodo, createRemoveTodo (for
                    parameterized handlers)
                  </ListItem>
                </List>
              </Box>

              <Box>
                <Heading variant="subtle">Inline Function Calls</Heading>
                <Text fontSize="sm" color="gray.600">
                  All computed values and event handlers use direct action references without arrow
                  functions, resulting in cleaner JSX and better performance.
                </Text>
              </Box>
            </VStack>
          </Section>
        </Collapse>

        {/* Code Structure */}
        <Box layerStyle="methodCard" w="full">
          <Heading variant="card">Implementation</Heading>
          <CodeTabs
            tabs={[
              {
                label: 'Store Structure',
                language: 'typescript',
                snippet: 'createTodoStore',
              },
              {
                label: 'Component Usage',
                language: 'tsx',
                snippet: 'TodoApp',
              },
            ]}
          />
        </Box>
        <Section titleSize="md" title={'Key Features Demonstrated'}>
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Fully Centralized change actions:</strong> All logic encapsulated in store
              actions and exposed as bound actions from the "$" property
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Selectors as properties:</strong> filteredTodos, completedCount, activeCount
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>DOM friendly methods:</strong> onChange handlers subsume all event parsing
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Action-Based Selectors:</strong> Computed values as actions rather than React
              useMemo
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Tactical Form Handling:</strong> Single onChange action using
              event.target.name pattern
            </ListItem>
          </List>
        </Section>
      </VStack>
    </Container>
  );
};

export default TodoApp;
