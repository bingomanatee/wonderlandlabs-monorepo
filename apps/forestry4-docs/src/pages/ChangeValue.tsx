import React from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import CodeTabs from '../components/CodeTabs.tsx';
import CodePanel from '../components/CodePanel';
import CounterDemo from '../components/ActionsState/CounterDemo';
import ItemDef from '../components/ItemDef';
import Section from '../components/Section';
import { DoDont, DoList, DoItem, DontList, DontItem } from '../components/DoDont';

const ChangeValue: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading variant="page">Change methods & State Management</Heading>
          <Text textStyle="body">
            Learn how to define actions and manage state updates in Forestry 4.
          </Text>
        </Box>

        <Section title="Accessing current state inside methods">
          <Text textStyle="body">
            Actions can access current state by examining <code>this.value</code>. As well, the
            mutate method will give you access to the current state as draft.
          </Text>
        </Section>

        <Section
          title="
              Bound methods on state.$
          "
        >
          <Text textStyle="body">
            The <code>.$</code> parameter gives you access to any custom methods you define in an
            extended class. (provided they do not start with "$".) This does not include
            getter/props. If you have a local method{' '}
            <code>{`onChangeName(e){this.set('name', e.target.value)`}</code> and pass{' '}
            <code>onChange={'state.$.onChangeName'}</code> it will work as expected; this vastly
            reduces noisy onCallbacks or lambdas.
          </Text>
        </Section>

        {/* Live Demo */}
        <Section title="Interactive Actions Demo">
          <Text textStyle="body">
            Try different action patterns and see how they update the state:
          </Text>

          <CounterDemo />
        </Section>

        {/* Source Code */}
        <Section title="Source Code">
          <Text textStyle="body">
            Here's the complete implementation of the actions demo above:
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Store Definition',
                language: 'typescript',
                snippet: 'storeDefinition',
                folder: 'ActionsState',
              },
              {
                label: 'React Integration',
                language: 'tsx',
                snippet: 'reactIntegrationDemo',
                folder: 'ActionsState',
              },
              {
                label: 'Action Patterns',
                language: 'typescript',
                snippet: 'actionPatterns',
                folder: 'ActionsState',
              },
            ]}
          />
        </Section>
        <Section title="Can change methods be async?">
          <Text textStyle="body">
            Yes - methods can be async. However a few considerations: Transactions cannot contain
            async actions. Its just not tenable to implement rollback and async behavior in the same
            system. however you can call (sync) transactions from <i>inside</i> an async function.
          </Text>
        </Section>

        <Section title="Updating State">
          <Heading variant="subtle">How to update state</Heading>
          <VStack spacing={4} align="stretch">
            <ItemDef
              title="set(path: string | string[], value: any): void"
              titleAsCode={true}
              snippetName="set-examples"
              snippetFolder="actions-state"
              language="typescript"
            >
              Sets a property in the state structure with a new value. Path can be a string or
              dot-separated deep path. Path can be the name of a single sub-property or can drill
              deep down into sub-properties of state.
            </ItemDef>

            <ItemDef
              title="mutate(updater: (draft: T) => void | T): void"
              titleAsCode={true}
              snippetName="mutate-examples"
              snippetFolder="actions-state"
              language="typescript"
              ts={true}
            >
              Allows you to edit the state as a normal mutable JavaScript object using Immer's
              produce function. <code>mudate(fn)</code> is a wrapper for{' '}
              <a target="_new" href="https://immerjs.github.io/immer/produce/">
                Immer's produce(fn)
              </a>
              utility.
            </ItemDef>

            <ItemDef
              title="next(value: T): void"
              titleAsCode={true}
              snippetName="next-examples"
              snippetFolder="actions-state"
              language="typescript"
              ts={true}
            >
              Replaces the entire state with a new value. The update must be <b>complete</b>.
              Generally the least useful method - prefer <code>set()</code>
              or <code>mutate()</code> for most cases. (FWIW
              <code>set</code> and <code>mutate</code> are wrappers for next.)
            </ItemDef>
          </VStack>
        </Section>
        {/* Best Practices */}
        <DoDont title="Action Best Practices">
          <DoList title="✅ Best Practices for State Change">
            <DoItem title="Keep methods focused">
              One method should do one thing well; delegate detailed up complex behaviors into
              several small helpers
            </DoItem>

            <DoItem title="Replace useState and callbacks">
              Forestry can replace most callbacks and useState artifacts in react; this makes your
              code cleaner and more testable.
            </DoItem>

            <DoItem title="Use the simplest change method available">
              Prefer using set to change a single property. If you want to change several properties
              or modify a complex type (eg pushing into an array) use mutate. On the rare case where
              you want to completely change every element of the state use next; but the less you
              use next the more maintainable your code is.
            </DoItem>

            <DoItem title="Use $.method in event listeners">
              There is no reason to wrap state methods - the "$" object has your custom methods
              pre-bound to your state and can be used directly in event listeners.
            </DoItem>
          </DoList>

          <DontList>
            <DontItem title="You cannot edit the value parameter">
              the value parameter <i>and</i> <code>this.value</code> are both
              <a href="https://immerjs.github.io/immer/">Immer</a> immutables that{' '}
              <i>cannot be edited</i> - this is even "more const than const";
              <code>Map.set</code> or <code>array.push/pop/etc</code> do not work on values. (this
              by the way is also true of Redux Toolkit actions).
              <br />
              <br />
              The <code>.mutate(lambda)</code> method is how you can directly edit state value.
            </DontItem>

            <DontItem title="Actions cannot be arrow functions (lambdas)">
              you cannot bind or change a lambdas' definiton of this so actions cannot be bound to
              state from the constructor definitions: eg.,
              <CodePanel
                snippetName="arrow-function-antipattern"
                folder="actions-state"
                language="typescript"
                ts={true}
              />
              will not give you the desired result as "this" will not be the store.
            </DontItem>
          </DontList>
        </DoDont>
      </VStack>
    </Container>
  );
};

export default ChangeValue;
