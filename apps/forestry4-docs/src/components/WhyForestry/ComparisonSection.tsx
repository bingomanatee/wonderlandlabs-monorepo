import React from 'react';
import {
  Badge,
  Box,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import Section from '@/components/Section.tsx';
import { DoDont, DoItem, DoList, DontItem, DontList } from '@/components/DoDont';

const ComparisonSection: React.FC = () => {
  return (
    <VStack spacing={8} align="stretch">
      <Heading variant="page">Yet Another Store System?</Heading>
      <Box>
        <Section title="Yes and here's why">
          <Box>
            <Text textStyle="body">
              Forestry grew from a profound disaffection in the status quo. Redux, mainly but also a
              lot of other alternatives including hooks. I saw the same patterns happening over and
              over again:
            </Text>
            <ul>
              <li>
                <b>A lack of the ability to synchronously update state</b>. There is no (good)
                reason that local state needs to be forced into async patterns. (as is the case in
                hooks) like RxJs (the backbone of Forestry) you should be able to change state and
                see results in real time. hooks for instance are particularly poor at reflecting the
                real time state of anything given the large refresh cycle of useState. In my
                experience, the federation that asynchronous code creates is a drag on
                comprehension, testability, reliability and maintainability; if it is not a natural
                side effect of activities that are naturally async, you're paying these costs not
                because your use case demands it but because you have adopted a control system that
                uses async processes for no good reason.
              </li>
              <li>
                <b>Far too much magic</b>. Actions should be straight up javascript code with as
                little magic as necessary.
              </li>
              <li>
                <b>Had coded state that is difficult to test</b>. Most state systems are so wed to
                their context that they are difficult to isolate; this violates separation of
                concerns and frankly most React testing is so painful that it behooves you to
                extricate the business logic and enable independent testing.
              </li>
              <li>
                <b>Abdication of responsibility for schema enforcement</b>; validation of change
                values before they are submitted into state is not something to be put in as
                optional nice to have or assumed to be a "solved problem" with typescript. State
                data is dynamic and often comes from sources outside the codebase (fetch), so
                typescript cannot enforce type sanity - state must take that responsibility to
                heart.
              </li>
              <li>
                <b>Lack of transactional atomicity</b>; often you need to make several changes in
                sequence and have them all succeed or fail; especially important with the use of
                nested actions. Forestry even allows you to temporarily suspend validation
                constraints while you change state over several steps as long as the net effect of
                transactions produce valid data.
              </li>
              <li>
                <b>Nested Actions</b>; composition is very difficult or impossible in many state
                systems; Forestry allows you to drill deep into multiple actions.
              </li>
              <li>
                <b>Complex or "magical" architecture</b>; it's easy to develop insular
                meta-languages that steepen the learning curve without commensurate gains in
                performance or scalability. This is true of Redux and equally true of systems like
                Saga.
              </li>
            </ul>
            <Text textStyle="body">
              Foresty has been written to address these features point by point. Many of the
              solutions are "passive" - some like <Link to="/validation">Validation</Link>
              require some tooling.
            </Text>
          </Box>

          <Box>
            <Heading variant="subtle">
              Simplicity that doesn't scale is a net loss in productivity
            </Heading>
            <Text textStyle="body">
              A lot of stores exist and trade off of their "simplicity". This is well and good - but
              simplicity is only good if it scales. Part of this is "can it be tested"; but part is
              also does it address mid and long term concerns or force the developers to invent
              custom solutions for routine tasks.
            </Text>
            <Text textStyle="body">
              Its easy to assume that TypeScript will enforce type sanity; however Typescript only
              ensures that the elements <i>coded by you</i> are internally consistent; and since you
              are chored with writing your own gate functions, even that is not always guaranteed.
              Real databases always ensure that the structure of your updates is consistent with the
              store. "Unopinionated" stores like Redux or hooks abdicate this responsibility to the
              developer.
            </Text>
            <Text textStyle="body">
              Similarly most backend controllers execute multiple sub-tasks with changes including
              validation, distribution of data, comparison with existing conditions and other
              "change triggered" utilities. Designing change systems that don't allow for
              "strategic" actions to trigger sub-actions for a more orchestrated process.{' '}
            </Text>
            <Text textStyle="body">
              This is key for scaling apps past inception because at some point the strategic
              methods may delegate to variations based on conditions; using sub-actions that you can
              switch is much more scalable than creating multiple nearly identical top-level
              actions. Consider for instance, a work flow that has three stages with two variations
              for each stage. Varying this requires either one central method with complex switching
              boilerplate inside it, or eight different top level functions with severe repetition.
            </Text>
          </Box>
        </Section>
      </Box>

      <Section title="The problem with deep data">
        <Text textStyle="body">
          Most store systems are simply not set up to handle "Deep" data structrures; they are
          optimized to flat or flattish key value stores and when the data gets significantly
          complex and detailed -- and it is a <i>when</i>, not if -- you end up either dealing with
          artificially managing detail in a cluttered "Top down" manner or balkanizing your data int
          a set of interrelated states that access each others content in a somewhat sloppy "ad hock
          graph DB" manner.
        </Text>
        <Text textStyle="body">
          Forestry allows you to manage deep structures through <b>branching</b>: creating
          arbitrarily deep sub-objects to manage any level of sub-scopes with custom methods
          appropriate to their scope. The complete tree is maintained by the "root" forest but the
          branch instances can give you focused methods for managing any level of detail in the
          structure you want. These sub-objects can be used temporarily to affect change at a
          detailed level or persist within a sub-component to provide a more focused access to the
          part of the state the component is concerned with.
        </Text>
      </Section>

      {/* Feature Comparison Table */}
      <Box layerStyle="card" bg="gray.50">
        <Heading variant="section">Feature Comparison</Heading>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Feature</Th>
                <Th textAlign="center">Forestry</Th>
                <Th textAlign="center">Redux</Th>
                <Th textAlign="center">Zustand</Th>
                <Th textAlign="center">Jotai</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td fontWeight="semibold">TypeScript Support</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Excellent</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Good</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Excellent</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Excellent</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Boilerplate</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Minimal</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Heavy</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Minimal</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Medium</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Validation</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Built-in</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">External</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">External</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">External</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Reactivity</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">RxJS</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Manual</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Manual</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Automatic</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">DevTools</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Built-in</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Excellent</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Basic</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Basic</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Learning Curve</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Gentle</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Steep</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Gentle</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Medium</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Action Testability</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Excellent</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Complex</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Manual</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Manual</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Atomic Operations</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Built-in</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Manual</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Manual</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Manual</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Context Independence</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Complete</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Coupled</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Partial</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Partial</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Real-time Feedback</Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Synchronous</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Async Only</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Limited</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Limited</Badge>
                </Td>
              </Tr>
              <Tr>
                <Td fontWeight="semibold">Bundle Size</Td>
                <Td textAlign="center">
                  <Badge colorScheme="yellow">Medium</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="red">Large</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Small</Badge>
                </Td>
                <Td textAlign="center">
                  <Badge colorScheme="green">Small</Badge>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* Key Differentiators */}
      <DoDont>
        <DoList title="✅ Forestry Advantages">
          <DoItem title="Built-in Validation">
            Three-layer validation system with runtime checks
          </DoItem>

          <DoItem title="RxJS Integration">Powerful reactive programming capabilities</DoItem>

          <DoItem title="Forest Branching">Unique field-level state management for forms</DoItem>

          <DoItem title="Quality Feedback">User-friendly validation messages</DoItem>

          <DoItem title="Very Testable">
            States can easily be tested without magical test library as it is self contained and
            synchronous
          </DoItem>
        </DoList>

        <DontList title="Potential Costs">
          <DontItem title="Learning Curve">
            New concepts like Forest branching and validation layers
          </DontItem>

          <DontItem title="Bundle Size">RxJS dependency adds to bundle size</DontItem>

          <DontItem title="Ecosystem">Newer library with smaller community</DontItem>
        </DontList>
      </DoDont>
    </VStack>
  );
};

export default ComparisonSection;
