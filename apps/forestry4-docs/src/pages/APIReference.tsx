import React from 'react';
import {
  Badge,
  Box,
  Code,
  Container,
  Flex,
  Heading,
  HStack,
  List,
  Link as LinkChakra,
  ListItem,
  Text,
  VStack,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';
import ItemDef from '@/components/ItemDef';
import { Link } from 'react-router-dom';

const APIReference: React.FC = () => {
  return (
    <Box>
      <Flex>
        {/* Fixed Sidebar Navigation */}
        <Box layerStyle="sidebar">
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={4}>
                API Reference
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Navigate to any section
              </Text>
            </Box>

            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" color="blue.600" mb={2}>
                  Core Classes
                </Text>
                <VStack spacing={1} align="stretch" pl={2}>
                  <LinkChakra href="#forest" layerStyle="navLink">
                    Forest
                  </LinkChakra>
                  <LinkChakra href="#forestbranch" layerStyle="navLink">
                    ForestBranch
                  </LinkChakra>
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="green.600" mb={2}>
                  Forest Methods
                </Text>
                <VStack spacing={1} align="stretch" pl={2}>
                  <LinkChakra href="#forest-constructor" layerStyle="navLink">
                    Constructor & Properties
                  </LinkChakra>
                  <LinkChakra href="#forest-core" layerStyle="navLink">
                    Core
                  </LinkChakra>
                  <LinkChakra href="#forest-branching" layerStyle="navLink">
                    Branching
                  </LinkChakra>
                  <LinkChakra href="#forest-transactions" layerStyle="navLink">
                    Transaction
                  </LinkChakra>
                  <LinkChakra href="#forest-validation" layerStyle="navLink">
                    Validation
                  </LinkChakra>
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="purple.600" mb={2}>
                  ForestBranch Methods
                </Text>
                <VStack spacing={1} align="stretch" pl={2}>
                  <LinkChakra href="#branch-properties" layerStyle="navLink">
                    Branch Properties
                  </LinkChakra>
                  <LinkChakra href="#branch-methods" layerStyle="navLink">
                    Overridden Methods
                  </LinkChakra>
                </VStack>
              </Box>

              <Box>
                <Text fontWeight="semibold" color="orange.600" mb={2}>
                  Types
                </Text>
                <VStack spacing={1} align="stretch" pl={2}>
                  <Link href="#types-config" layerStyle="navLink">
                    Configuration Types
                  </Link>
                  <Link href="#types-actions" layerStyle="navLink">
                    Action Types
                  </Link>
                  <Link href="#types-validation" layerStyle="navLink">
                    Validation Types
                  </Link>
                  <Link href="#types-utility" layerStyle="navLink">
                    Utility Types
                  </Link>
                </VStack>
              </Box>
            </VStack>
          </VStack>
        </Box>

        {/* Main Content */}
        <Box layerStyle="mainContent">
          <Container maxW="container.lg">
            <VStack spacing={12} align="stretch">
              {/* Header */}
              <Box>
                <Heading size="xl" mb={4}>
                  API Reference
                  <Badge ml={3} colorScheme="blue">
                    Reference
                  </Badge>
                </Heading>
                <Text textStyle="hero">
                  Complete API documentation for Forest and ForestBranch classes.
                </Text>
              </Box>

              {/* Forest Class */}
              <Box id="forest">
                <HStack mb={4}>
                  <Heading size="lg">Forest</Heading>
                  <Badge colorScheme="green">Class</Badge>
                </HStack>
                <Text textStyle="body">
                  The primary reactive state management class that supports branching and
                  hierarchical state management. Forest includes all core store functionality plus
                  advanced features for managing complex nested data structures.
                </Text>
              </Box>

              {/* Forest Constructor & Properties */}
              <Box id="forest-constructor" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Constructor & Properties
                </Heading>

                <Box mb={6}>
                  <ItemDef title="new Forest&lt;DataType, Actions&gt;(params: StoreParams)">
                    Creates a new Forest instance with the specified data type and actions. Forest
                    is the root store that can create branches.
                  </ItemDef>
                </Box>

                <Heading size="sm" mb={3}>
                  Properties
                </Heading>
                <List spacing={3}>
                  <ListItem>
                    <Code>value: DataType</Code> - Current forest value (readonly)
                  </ListItem>
                  <ListItem>
                    <Code>name: string</Code> - Forest identifier
                  </ListItem>
                  <ListItem>
                    <Code>$: Actions</Code> - Exposed <Link to="/actions'">action</Link> methods.
                  </ListItem>
                  <ListItem>
                    <Code>acts: Actions</Code> - Alias for $ property
                  </ListItem>
                  <ListItem>
                    <Code>res: Map&lt;string, any&gt;</Code> - container for external resources such
                    as database connectors, DOM references. Changing res entries does not trigger
                    any subscriber updates.
                  </ListItem>
                  <ListItem>
                    <Code>isActive: boolean</Code> - Whether forest accepts updates; set to false
                    when <code>complete()</code> is called
                  </ListItem>
                  <ListItem>
                    <Code>path: Path</Code> - the path between this store and its parent; is empty
                    array [] for root Forest
                  </ListItem>
                  <ListItem>
                    <Code>parent?: StoreBranch</Code> - null for root Forest
                  </ListItem>
                  <ListItem>
                    <Code>isRoot: boolean</Code> - Always true for Forest
                  </ListItem>
                  <ListItem>
                    <Code>root: Forest</Code> - Returns self (this)
                  </ListItem>
                </List>
              </Box>

              {/* Forest Core Methods */}
              <Box id="forest-core" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Core Methods
                </Heading>

                <VStack spacing={6} align="stretch">
                  <ItemDef
                    title="next(value: Partial&lt;DataType&gt;): void"
                    snippetName="nextExample"
                    snippetFolder="APIReference"
                    codeTitle="Updating Forest Values"
                  >
                    Updates the forest with a new value.
                  </ItemDef>

                  <ItemDef
                    title="subscribe(listener: Listener&lt;DataType&gt;): Subscription"
                    snippetName="subscribeExample"
                    snippetFolder="APIReference"
                    codeTitle="Subscribing to Changes"
                  >
                    Subscribes to forest changes. Returns RxJS Subscription for cleanup.
                  </ItemDef>

                  <ItemDef
                    title="get(path?: Path): any"
                    snippetName="getPathExample"
                    snippetFolder="APIReference"
                    codeTitle="Getting Values by Path"
                  >
                    Gets value at specified path. Returns entire value if no path provided.
                  </ItemDef>

                  <ItemDef
                    title="set(path: Path, value: unknown): boolean"
                    snippetName="setValueExample"
                    snippetFolder="APIReference"
                    codeTitle="Setting Values Example"
                  >
                    Sets value at specified path using Immer for immutable updates. Returns true if
                    successful.
                  </ItemDef>

                  <ItemDef title="complete(): DataType">
                    Completes the forest and all branches, preventing further updates. Returns final
                    value. note - branch completions effect only that branch and any sub-branches it
                    spawned; completing the root Forest will terminate the entire forest and all its
                    branches and sub-branches.
                  </ItemDef>
                </VStack>
              </Box>

              {/* Forest Branching Methods */}
              <Box id="forest-branching" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Branching Methods
                </Heading>

                <VStack spacing={6} align="stretch">
                  <ItemDef
                    title="branch&lt;Type, Actions&gt;(path: Path, params: BranchParams): ForestBranch"
                    snippetName="branchCreationExample"
                    snippetFolder="APIReference"
                    codeTitle="Branch Creation Example"
                  >
                    Creates a new branch at the specified path with its own actions and validation.
                    This is the key feature that makes Forest powerful for managing nested state.
                  </ItemDef>
                </VStack>
              </Box>

              {/* Forest Transaction Methods */}
              <Box id="forest-transactions" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Transaction Methods
                </Heading>

                <VStack spacing={6} align="stretch">
                  <ItemDef
                    title="transact(params: TransParams | TransFn, suspendValidation?: boolean): void"
                    snippetName="transactMethodExamples"
                    snippetFolder="Transactions"
                    codeTitle="Transaction Examples"
                  >
                    Executes multiple operations as a single atomic transaction across the forest
                    and all branches. All changes within the transaction are applied atomically. It
                    is possible to nest transactions - in which case all subscriptions are suspended
                    until the outermost transactions complete. Any thrown (uncaught) error suspends
                    a transaction and reverts <i>all</i> updates made since the beginning of that
                    transaction; in the case of nested transaction, its possible to catch the inner
                    transactions' error in which case the state will be the same as it was before
                    the inner transaction started. <b>action must NOT be a lambda/arrow function</b>
                    .
                  </ItemDef>
                </VStack>
              </Box>

              {/* Forest Validation Methods */}
              <Box id="forest-validation" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Validation Methods
                </Heading>

                <VStack spacing={6} align="stretch">
                  <ItemDef
                    title="validate(value: unknown): Validity"
                    snippetName="validateMethod"
                    snippetFolder="APIReference"
                    codeTitle="Validation Examples"
                  >
                    Validates a value against schema and tests. Returns validity object with
                    detailed error information. If the current state of the store is under a
                    transaction with suspendValidation, it will always return isValid: true.
                    validate captures any thrown errors from validation functions into the feedback.
                  </ItemDef>

                  <ItemDef
                    title="test(value: unknown): Validity"
                    snippetName="testMethod"
                    snippetFolder="APIReference"
                    codeTitle="Test Function Examples"
                  >
                    Identical to validate -- however it ignores any transactional /
                    suspendValidation conditions
                  </ItemDef>
                </VStack>
              </Box>

              {/* ForestBranch */}
              <Box id="forestbranch" layerStyle="methodCard">
                <HStack mb={4}>
                  <Heading size="lg">ForestBranch</Heading>
                  <Badge colorScheme="purple">Class</Badge>
                </HStack>
                <Text textStyle="body" mb={6}>
                  ForestBranch provides a focused interface for managing a specific part of a
                  Forest's data. It inherits all Forest methods but operates on a specific path
                  within the parent Forest, automatically synchronizing changes bidirectionally. You
                  can create a transient branch to do a focused operation on a subset of the store
                  or to observe specific subsets of the store hierarchy. It is the output of the
                  <code>branch(path)</code> method of Forest or ForestBranch.
                </Text>

                <Heading size="md" mb={4}>
                  Key Properties
                </Heading>

                <List spacing={3}>
                  <ListItem>
                    <Code>path: Path</Code> - Path from parent to this branch.
                  </ListItem>
                  <ListItem>
                    <Code>parent: Forest | ForestBranch</Code> - Parent forest or branch that
                    created this branch
                  </ListItem>
                  <ListItem>
                    <Code>root: Forest</Code> - Reference to the root Forest instance
                  </ListItem>
                  <ListItem>
                    <Code>isRoot: boolean</Code> - Always false for branches
                  </ListItem>
                  <ListItem>
                    <Code>value: DataType</Code> - Current value at this branch's path (computed
                    from parent)
                  </ListItem>
                  <ListItem>
                    <Code>$: Actions</Code> - Branch-specific action methods that operate on this
                    path
                  </ListItem>
                </List>

                <Text textStyle="body" mt={4}>
                  ForestBranch inherits all Forest methods (next, get, set, mutate, subscribe, etc.)
                  but they operate on the branch's specific path within the parent Forest, not on
                  independent state. also completing a branch completes it and its sub-items but not
                  the parent / or upwwards stores, including the root.
                </Text>
              </Box>

              {/* Type Definitions */}
              <Box>
                <HStack mb={4}>
                  <Heading size="lg">Type Definitions</Heading>
                  <Badge colorScheme="orange">Types</Badge>
                </HStack>
                <Text textStyle="body">
                  Key TypeScript interfaces and types used throughout Forestry 4.
                </Text>
              </Box>

              {/* Configuration Types */}
              <Box id="types-config" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Constructor parameter structure
                </Heading>

                <VStack spacing={6} align="stretch">
                  <ItemDef title="StoreParams&lt;DataType, Actions&gt;">
                    Configuration object for creating Forest instances. Contains:
                    <ul>
                      <li>
                        value <Badge colorScheme="red">Required</Badge>{' '}
                      </li>
                      <li>actions</li>
                      <li>schema</li>
                      <li>tests</li>
                      <li>prep</li>
                      <li>name</li>
                    </ul>
                  </ItemDef>

                  <ItemDef title="BranchParams&lt;DataType, Actions&gt;">
                    Identical to StoreParams except it has no value, and has a <code>path</code>
                    parameter; branches' parameter is read from the root Forest instance via chained
                    path between the branch and the root Forestry
                  </ItemDef>
                </VStack>
              </Box>

              {/* Action Types */}
              <Box id="types-actions" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Action Types
                </Heading>

                <VStack spacing={6} align="stretch">
                  <ItemDef title="ActionParamsFn&lt;DataType, Args, Returned&gt;">
                    Function signature for action definitions (with value parameter).
                  </ItemDef>

                  <ItemDef title="ActionExposedFn&lt;Args, Returned&gt;">
                    Function signature for exposed actions (without value parameter).
                  </ItemDef>
                </VStack>
              </Box>

              {/* Validation Types */}
              <Box id="types-validation" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Validation Types
                </Heading>

                <VStack spacing={6} align="stretch">
                  <ItemDef title="ValueTestFn&lt;DataType&gt;">
                    Function that tests a value and returns error message or null -- or throws.
                  </ItemDef>

                  <ItemDef title="Validity">
                    Object returned by test and isValid
                    <ul>
                      <li>isValid: boolean</li>
                      <li>error?: Error</li>
                    </ul>
                  </ItemDef>

                  <ItemDef title="ValidationResult">
                    String error message or null for valid values.
                  </ItemDef>
                </VStack>
              </Box>

              {/* Utility Types */}
              <Box id="types-utility" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Utility Types
                </Heading>

                <VStack spacing={6} align="stretch">
                  <ItemDef title="Path">
                    String (<code>user.id</code>) array (<code>['user', 'id']</code>) of strings
                    representing object path.
                  </ItemDef>

                  <ItemDef title="Listener&lt;DataType&gt;">
                    Function that receives store value changes. it can be either a simple
                    one-property function or a structured{' '}
                    <a href="https://rxjs.dev/api/index/interface/Observer">Observer</a>.
                  </ItemDef>

                  <ItemDef title="ResourceMap">
                    Map for storing external resources (DOM, WebGL, etc.).
                  </ItemDef>
                </VStack>
              </Box>

              {/* Usage Examples */}
              <Box>
                <HStack mb={4}>
                  <Heading size="lg">Examples</Heading>
                  <Badge colorScheme="teal">Examples</Badge>
                </HStack>
                <Text textStyle="body">Common usage patterns and examples for each API.</Text>

                <HStack spacing={4} wrap="wrap" mt={4}>
                  <Link to="/basic">
                    <Badge colorScheme="blue" p={2}>
                      <InfoIcon mr={2} />
                      Store Basics
                    </Badge>
                  </Link>

                  <Link to="/react">
                    <Badge colorScheme="green" p={2}>
                      <InfoIcon mr={2} />
                      React Integration
                    </Badge>
                  </Link>

                  <Link to="integration">
                    <Badge colorScheme="purple" p={2}>
                      <InfoIcon mr={2} />
                      Validation System
                    </Badge>
                  </Link>
                </HStack>
              </Box>
            </VStack>
          </Container>
        </Box>
      </Flex>
    </Box>
  );
};

export default APIReference;
