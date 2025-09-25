import React from 'react';
import { Box, Container, Heading, Text, VStack, Alert, AlertIcon } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import CodeTabs from '../components/CodeTabs.tsx';
import Section from '../components/Section';
import ItemDef from '../components/ItemDef';
import { DoDont, DoList, DoItem, DontList, DontItem } from '../components/DoDont';
import BranchingDemo from '../components/Branching/BranchingDemo';

const Branching: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading variant="page">Branching Deep Dive</Heading>
          <Text textStyle="hero">
            Master Forestry's branching system to create focused, maintainable, and testable state
            management. Learn the how and more importantly, the why behind branches.
          </Text>
        </Box>

        {/* Why Branches? */}
        <Section title="Why Use Branches?">
          <Text textStyle="body" mb={4}>
            Branches solve the fundamental problem of <strong>state organization</strong>
            in complex applications. Instead of managing everything in one monolithic store,
            branches let you create focused, single-responsibility sub-stores that automatically
            stay synchronized with their parent.
          </Text>

          <Alert status="info" mb={4}>
            <AlertIcon />
            <Text>
              Think of branches like focused teams in a company - each team has its own
              responsibilities and expertise, but they all work toward the same organizational goals
              and share information when needed.
            </Text>
          </Alert>

          <CodeTabs
            tabs={[
              {
                label: 'The Problem',
                language: 'typescript',
                snippet: 'whyBranching',
                folder: 'Branching',
              },
            ]}
          />
        </Section>

        {/* Interactive Demo */}
        <Section title="Interactive Branching Demo">
          <Text textStyle="body" mb={4}>
            Experience how branches work in practice. Each section below represents a different
            branch of the same root store. Notice how changes automatically synchronize:
          </Text>

          <BranchingDemo />
        </Section>

        <Section title="Branch Lifespan">
          <Text textStyle="body">
            Branches can be as short-lived as you want - you can even create a branch, call a method
            on it, then <code>.complete()</code> it. Unlike calling root-level complete which
            freezes the entire store (and all its branches), completing a branch only terminates the
            utility of <i>that branch</i>
            and all its' branches; the parent and all other sibling branches (and the root) remain
            functional. In fact, if you don't need a branch, its a good idea to complete() it and
            lower the bandwidth for the entire system.
          </Text>
          <Text textStyle="body">
            Similarly you can create a branch as late as you want - you don't need to create all the
            branches at once of you don't need them until later.
          </Text>
        </Section>

        {/* How Branches Work */}
        <Section title="How Branches Work">
          <Text textStyle="body" mb={4}>
            Branches are <strong>focused sub-stores</strong> that represent a specific path in your
            state tree. They maintain automatic two-way synchronization with their parent store and
            provide all the same capabilities as root stores.
          </Text>

          <Text textStyle="body">
            In reality only the root "owns" the value - all the branches <i>refer</i> to part of the
            store (a "sub path" of the overall data) with methods specific to changing and analyzing
            that branch. This can be repeated to any depth you want. why this matters, for instance,
            is that all transactions are actually managed by the root store, even if they are
            created in a branch store.
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Basic Creation',
                language: 'typescript',
                snippet: 'basicBranchCreation',
                folder: 'Branching',
              },
              {
                label: 'Synchronization',
                language: 'typescript',
                snippet: 'branchSynchronization',
                folder: 'Branching',
              },
            ]}
          />
        </Section>

        {/* Branch Subclassing */}
        <Section title="Custom Branch Classes">
          <Text textStyle="body" mb={4}>
            The real power of branches comes from creating custom subclasses with domain-specific
            methods and computed properties. This creates focused, reusable components that
            encapsulate business logic.
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Custom Branch Classes',
                language: 'typescript',
                snippet: 'branchSubclassing',
                folder: 'Branching',
              },
            ]}
          />
        </Section>

        {/* Branch Validation */}
        <Section title="Branch Validation">
          <Text textStyle="body" mb={4}>
            Branches can have their own validation schemas and rules, providing focused validation
            at the appropriate level of your state tree. This is especially powerful for form
            validation and data integrity. Be careful though - the more validation you add to branch
            instances, the more limited <i>every</i> store becomes. If you create a store with
            schema and tests, then even changes to data in the root scope will trigger schema and
            branch validation to <i>all the branches</i> - all the way down the hierarchy - which if
            they become too numerous may become a performance consideration, as well as a burden to
            developers to understand why their changes are being blocked.
            <Alert status="info" mb={4}>
              <AlertIcon />
              <Text>
                One thing you may <i>not</i> want to do is define schema for every branch; if the
                top level schema is inclusive it's redundant and just creates more work for you to
                maintain, and for the state system to process with every update.
              </Text>
            </Alert>
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Validation Examples',
                language: 'typescript',
                snippet: 'branchValidation',
                folder: 'Branching',
              },
            ]}
          />
        </Section>

        {/* React Integration */}
        <Section title="React Integration">
          <Text textStyle="body" mb={4}>
            Branches shine in React applications by allowing components to subscribe to only the
            data they need. This improves performance and makes components more focused and
            testable. That is, if you create a memoized component and have it depend on the data
            from a branch, <b>it will re-render less often</b> than if you pass the value of the
            global state into it and select part of that data inside the components' context.
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'React Components',
                language: 'tsx',
                snippet: 'reactBranchIntegration',
                folder: 'Branching',
              },
            ]}
          />
        </Section>

        {/* API Reference */}
        <Section title="Branch API Reference">
          <VStack spacing={4} align="stretch">
            <ItemDef
              title="$branch<T, S>(path: Path, params: BranchParams<T, S>): S"
              titleAsCode={true}
            >
              Creates a new branch at the specified path. The branch automatically synchronizes with
              the parent store and can have its own subclass, validation, and configuration.
            </ItemDef>

            <ItemDef title="$parent: StoreIF | undefined" titleAsCode={true}>
              Reference to the parent store. Root stores have no parent (undefined).
            </ItemDef>

            <ItemDef title="$path: Path | undefined" titleAsCode={true}>
              The path from the parent store to this branch (e.g., ['user', 'profile']). note -
              paths are <i>relative</i> to the parent not <i>absolute</i> to the root. (the{' '}
              <code>fullPath</code> property will give you the absolute path between the current and
              the root store in complex branching)
            </ItemDef>

            <ItemDef title="$root: StoreIF" titleAsCode={true}>
              Reference to the root store in the hierarchy. For root stores, returns self.
            </ItemDef>

            <ItemDef title="$isRoot: boolean" titleAsCode={true}>
              True if this is a root store, false if it's a branch.
            </ItemDef>
          </VStack>
        </Section>

        {/* Best Practices */}
        <DoDont title="Branching Best Practices">
          <DoList title="✅ Best Practices">
            <DoItem title="Create focused, single-responsibility branches">
              Each branch should represent a logical domain or feature area.
            </DoItem>

            <DoItem title="Use factory methods (.$branch) for branch creation">
              Although you <i>can</i> branch manually by creating an instance with a parent and
              branch defined in their configuration, its best to use the{' '}
              <code>.$branch(path, config)</code> method to branch from one store.
            </DoItem>

            <DoItem title="Keep branch hierarchies shallow">
              Aim for 2-3 levels maximum. Deep hierarchies become hard to understand and maintain.
            </DoItem>

            <DoItem title="Use branches for testing isolation">
              Branches make it easy to test individual features in isolation without setting up
              complex state scenarios.
            </DoItem>

            <DoItem title="Leverage branch validation">
              Use Zod schemas or custom validation functions to ensure data integrity at the
              appropriate level of your state tree.
            </DoItem>

            <DoItem title="Create reusable branch patterns">
              For common patterns like lists or forms, create reusable branch classes that can be
              applied to different data types.
            </DoItem>
          </DoList>

          <DontList>
            <DontItem title="Don't over-branch">
              Branches should represent logical units, not individual properties. Creating too many
              micro-branches adds complexity without benefit. You may find a deep list with hundreds
              of records may not perform well - in such a case you may perfer a more top-down
              pattern of data management.
            </DontItem>

            <DontItem title="Don't mix unrelated concerns">
              Keep user profile logic separate from shopping cart logic separate from UI state. Each
              branch should have a clear, focused purpose.
            </DontItem>
            <DontItem title="Don't ignore validation opportunities">
              You may find it easier to define detailed validation in a branch; given their focus on
              deeper parts of the structure it can clean out the code at the higher levels of the
              store.
            </DontItem>
            <DontItem title="Don't create multiple nested branches you don't need">
              the <code>branch</code> parameter can be many levels deep as in ['users', 200]; you
              don't have to create branches for every level of depth if you are really only
              concerned with the last level of detail.
            </DontItem>
          </DontList>
        </DoDont>

        {/* Advanced Patterns */}
        <Section title="Advanced Patterns">
          <Text textStyle="body" mb={4}>
            Once you master basic branching, these advanced patterns will help you build more
            sophisticated and maintainable applications:
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Best Practices',
                language: 'typescript',
                snippet: 'branchBestPractices',
                folder: 'Branching',
              },
            ]}
          />
        </Section>

        {/* Related Topics */}
        <Section title="Related Topics">
          <Text textStyle="body">
            Now that you understand branching, explore these related topics:
          </Text>
          <VStack spacing={2} align="start" mt={4}>
            <Text>
              • <Link to="/validation">Validation System</Link> - Deep dive into validation with
              branches
            </Text>
            <Text>
              • <Link to="/transactions">Transactions</Link> - Atomic operations across branches
            </Text>
            <Text>
              • <Link to="/react-integration">React Integration</Link> - Using branches in React
              components
            </Text>
            <Text>
              • <Link to="/examples">Examples</Link> - Real-world applications using branches
            </Text>
          </VStack>
        </Section>
      </VStack>
    </Container>
  );
};

export default Branching;
