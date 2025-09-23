import React from 'react';
import {
  Badge,
  Box,
  Code,
  Container,
  Flex,
  Heading,
  HStack,
  Link as LinkChakra,
  List,
  ListItem,
  Text,
  VStack,
} from '@chakra-ui/react';
import ItemDef from '@/components/ItemDef';
import { Link } from 'react-router-dom';
import Section from '@/components/Section.tsx';

const APIReference: React.FC = () => {
  return (
    <Box>
      <Flex>
        {/* Fixed Sidebar Navigation */}
        <Box layerStyle="sidebar" mt={8}>
          <VStack spacing={6} align="stretch">
            <Heading>API</Heading>

            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" color="blue.600" mb={2}>
                  Core Classes
                </Text>
                <VStack spacing={1} align="stretch" pl={2}>
                  <LinkChakra href="#forest" layerStyle="navLink">
                    Forest
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
                <Text fontWeight="semibold" color="orange.600" mb={2}>
                  Types
                </Text>
                <VStack spacing={1} align="stretch" pl={2}>
                  <LinkChakra href="#types-config" layerStyle="navLink">
                    Configuration Types
                  </LinkChakra>
                  <LinkChakra href="#types-validation" layerStyle="navLink">
                    Validation Types
                  </LinkChakra>
                  <LinkChakra href="#types-utility" layerStyle="navLink">
                    Utility Types
                  </LinkChakra>
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
                <Heading variant="page">Forest API</Heading>
                <Text textStyle="hero">
                  Complete API documentation for Forest and ForestBranch classes.
                </Text>
              </Box>

              {/* Forest Class */}
              <Section title="Forest class" id="forest">
                <Text textStyle="body">
                  The state management class that supports branching and hierarchical state
                  management. Forest includes all core store functionality plus advanced features
                  for managing complex nested data structures. In general you will subclass this
                  class to add custom action / method utility but it can be used directly
                </Text>
              </Section>

              {/* Forest Constructor & Properties */}
              <Section id="forest-constructor" title="Construtcor and properties">
                <Box mb={6}>
                  <ItemDef title="new Forest&lt;DataType&gt;(params: StoreParams)">
                    Creates a new Forest instance with the specified data type and actions. In
                    general you will subclass Forest to enable custom methods, but you can
                    instantiate a Forest directly if you only wish to use base methods.
                  </ItemDef>
                </Box>

                <Box>
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
                      <Code>res: Map&lt;string, any&gt;</Code> - container for external resources
                      such as database connectors, DOM references. Changing res entries does not
                      trigger any subscriber updates. Mainly useful for direct Forest instances that
                      need un-storable values (Dom references etc.)
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
                      <Code>isRoot: boolean</Code> - whether the branch has a parent or is the root.
                    </ListItem>
                    <ListItem>
                      <Code>root: Forest</Code> - Returns self (this) for a root Forest
                      implementation, and topmost forest on a branch
                    </ListItem>
                  </List>
                </Box>
              </Section>

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
                    title="$branch&lt;Type, Actions&gt;(path: Path, params: StoreParams&lt;Type&gt;): ForestBranch"
                    snippetName="branchCreationExample"
                    snippetFolder="APIReference"
                    codeTitle="Branch Creation Example"
                  >
                    Creates a new branch at the specified path with its own actions and validation.
                    The utility of a branch is that it focuses on a subsection of state and can have
                    focused methods that target specific elements of the store.
                    <br /> <br />
                    The params have an optional parameter <code>subclass</code> that defines a class
                    that will be returned by the $branch method. Also, <code>value</code> is neither
                    required nor used as a parameter; value is inferred by the path from the parent
                    Forest.
                  </ItemDef>
                </VStack>
              </Box>

              {/* Forest Transaction Methods */}
              <Box id="forest-transactions" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Transaction Methods
                  <Link to="/transactions" style={{ marginLeft: '12px' }}>
                    <Badge colorScheme="blue" fontSize="xs">
                      See detailed guide →
                    </Badge>
                  </Link>
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
                  <Link to="/validation" style={{ marginLeft: '12px' }}>
                    <Badge colorScheme="green" fontSize="xs">
                      See detailed guide →
                    </Badge>
                  </Link>
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
                  <ItemDef title="StoreParams&lt;DataType&gt;">
                    Configuration object for creating Forest instances. Contains:
                    <ul>
                      <li>
                        value <Badge colorScheme="red">Required</Badge>{' '}
                      </li>
                      <li>schema</li>
                      <li>tests</li>
                      <li>prep</li>
                      <li>name</li>
                    </ul>
                  </ItemDef>
                </VStack>
              </Box>

              {/* Validation Types */}
              <Box id="types-validation" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Validation Types
                  <Link to="/schemas" style={{ marginLeft: '12px' }}>
                    <Badge colorScheme="purple" fontSize="xs">
                      See Schema guide →
                    </Badge>
                  </Link>
                </Heading>

                <VStack spacing={6} align="stretch">
                  <ItemDef title="ValueTestFn&lt;DataType&gt;">
                    Function that tests a value and returns error message or null -- or throws.
                    valid values should return falsy value or not return anything.
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
            </VStack>
          </Container>
        </Box>
      </Flex>
    </Box>
  );
};

export default APIReference;
