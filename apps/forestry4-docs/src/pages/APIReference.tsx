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
                <Text fontWeight="semibold" color="purple.600" mb={2}>
                  Core Concepts
                </Text>
                <VStack spacing={1} align="stretch" pl={2}>
                  <LinkChakra href="#path" layerStyle="navLink">
                    Path
                  </LinkChakra>
                </VStack>
              </Box>

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

              {/* Path */}
              <Box id="path" layerStyle="methodCard">
                <Heading size="md" mb={4}>
                  Path
                </Heading>

                <VStack spacing={6} align="stretch">
                  <ItemDef title="Path = string | PathElement[]">
                    A Path identifies a value inside a Forest value. It lets methods target one
                    nested value without replacing or reading the whole store.
                    <Code>get(path)</Code> reads at that location; <Code>set(path, value)</Code>
                    writes there; and path-scoped <Code>mutate(path, updater)</Code> edits that
                    location through Immer.
                  </ItemDef>

                  <ItemDef title="Dot-string paths">
                    A string path is split on dots and is best for object keys:
                    <Code>user.profile.email</Code> targets
                    <Code>{`value.user.profile.email`}</Code>. Use this form for simple object data
                    and form fields.
                  </ItemDef>

                  <ItemDef title="Array paths">
                    An array path gives each path segment directly:
                    <Code>{`['users', 0, 'email']`}</Code>. Use arrays when a path includes array
                    indexes, Map keys, Set-like lookup values, or any key that is not a simple
                    dot-string segment.
                  </ItemDef>

                  <ItemDef title="Map keys and object references">
                    For Map data, a path array can include the actual Map key. JavaScript Map object
                    keys are reference-based, so a new object with the same fields is not the same
                    key. Use
                    <Code>filterPath</Code> when callers should pass a semantic key and the store
                    should resolve it to an existing Map key reference. See the{' '}
                    <Code>filterPath</Code> config parameter below.
                  </ItemDef>

                  <ItemDef title="Branch paths">
                    Branch APIs also use paths. A branch path identifies the part of the parent
                    store that the branch wraps. Branch values are always read from the parent at
                    that path. See <Link to="/branching">Branching</Link> for branch-specific path
                    behavior.
                  </ItemDef>
                </VStack>
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
                      <Code>$name: string</Code> - Forest identifier
                    </ListItem>
                    <ListItem>
                      <Code>$bound: BoundStoreMethods</Code> - Bound
                      <Link to="/bound-methods"> method</Link> mirror for event listeners.
                    </ListItem>
                    <ListItem>
                      <Code>$: BoundStoreMethods</Code> - Short alias for
                      <Code>$bound</Code>.
                    </ListItem>
                    <ListItem>
                      <Code>$res: Map&lt;string, any&gt;</Code> - container for external resources
                      such as database connectors, DOM references. Changing res entries does not
                      trigger any subscriber updates. Mainly useful for direct Forest instances that
                      need un-storable values (Dom references etc.)
                    </ListItem>
                    <ListItem>
                      <Code>isActive: boolean</Code> - Whether forest accepts updates; set to false
                      when <code>complete()</code> is called
                    </ListItem>
                    <ListItem>
                      <Code>$path: Path</Code> - the path between this store and its parent; is
                      empty array [] for root Forest
                    </ListItem>
                    <ListItem>
                      <Code>$parent?: StoreIF</Code> - null for root Forest
                    </ListItem>
                    <ListItem>
                      <Code>$isRoot: boolean</Code> - whether the branch has a parent or is the
                      root.
                    </ListItem>
                    <ListItem>
                      <Code>$root: Forest</Code> - Returns self (this) for a root Forest
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
                    title="set(path: Path, value: unknown): void"
                    snippetName="setValueExample"
                    snippetFolder="APIReference"
                    codeTitle="Setting Values Example"
                  >
                    Sets value at specified path using Immer for immutable updates. If the store
                    defines <Code>filterPath</Code>, the path is normalized before the write.
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
                    title="$transact(params: TransParams | TransFn, suspendValidation?: boolean): void"
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
                    title="$validate(value: unknown): Validity"
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
                    title="$test(value: unknown): Validity"
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
                    Configuration object for creating root Forest instances. Only
                    <Code>value</Code> is required. Every other parameter is an optional layer for
                    validation, path normalization, resources, debugging, or branch setup.
                    <ul>
                      <li>
                        value <Badge colorScheme="red">Required</Badge>{' '}
                      </li>
                      <li>schema</li>
                      <li>tests</li>
                      <li>prep</li>
                      <li>filterPath</li>
                      <li>name</li>
                      <li>resources / res</li>
                      <li>debug</li>
                      <li>subclass</li>
                      <li>branchClasses</li>
                      <li>branchParams</li>
                    </ul>
                  </ItemDef>

                  <ItemDef title="value: DataType">
                    Required initial state. Use this for the whole root store value: object, array,
                    Map, Set, primitive, or any other Immer-compatible value. Branches do not need a
                    separate value; branch values come from the parent value at the branch path. See{' '}
                    <Link to="/store">Store Basics</Link> for constructor examples and{' '}
                    <Link to="/change">Changing Values</Link> for update patterns.
                  </ItemDef>

                  <ItemDef title="schema?: z.ZodSchema&lt;DataType&gt;">
                    Optional Zod schema used to validate structural shape before updates are
                    accepted. Use schema for type and shape rules: required fields, nested object
                    structure, enums, ranges, and other constraints that belong to the value itself.
                    See <Link to="/schemas">Schemas</Link>, <Link to="/validation">Validation</Link>
                    , and the <Link to="/examples/form-validation">Form Validation example</Link>.
                  </ItemDef>

                  <ItemDef title="tests?: ValueTestFn | ValueTestFn[]">
                    Optional custom validation functions. Use tests for business rules that need
                    code: cross-field checks, catalog lookups, inventory limits, uniqueness checks,
                    or anything too contextual for schema alone. A test should return a message,
                    return nothing for valid data, or throw. See{' '}
                    <Link to="/validation">Validation</Link> and the{' '}
                    <Link to="/examples/shopping-cart">Shopping Cart example</Link>.
                  </ItemDef>

                  <ItemDef title="prep?: (input, current) =&gt; DataType">
                    Optional normalization step that runs before validation and commit. Use prep to
                    derive values, fill defaults, trim or sanitize incoming data, or merge partial
                    input into the current value. Keep schema focused on structure and prep focused
                    on transformation. See <Link to="/schemas">Schemas</Link> for schema/prep
                    integration and <Link to="/store">Store Basics</Link> for lifecycle context.
                  </ItemDef>

                  <ItemDef title={'filterPath?: (path: Path, store: StoreIF<DataType>) => Path'}>
                    Optional path normalization layer used by <Code>get</Code>, <Code>set</Code>,
                    and path-scoped <Code>mutate</Code>. Use it when UI or caller paths should stay
                    semantic while stored data uses array indexes, Map keys, or another internal
                    shape. It is optional; it exists to improve the API your UI uses, not to make
                    every store define a path layer. A common use is Map data keyed by objects.
                    JavaScript Map compares object keys by reference, so a new object with the same
                    fields is not the same key. <Code>filterPath</Code> can map an input like{' '}
                    <Code>{`{ name: 'Dave', email: 'd@w.com' }`}</Code> to the existing key object
                    already held by the Map, so
                    <Code>get</Code> and <Code>set</Code> return the expected value. See{' '}
                    <Link to="/change">Changing Values</Link> for update patterns.
                  </ItemDef>

                  <ItemDef title="name?: string">
                    Optional store label. Use it for debugging, logging, and making multiple stores
                    easier to identify. It does not affect state shape or updates. See{' '}
                    <Link to="/store">Store Basics</Link> for constructor examples.
                  </ItemDef>

                  <ItemDef title={'resources?: ResourceMap; res?: Map<string, any>'}>
                    Optional external resource map. Use this for non-stateful objects a store needs
                    to reach, such as DOM references, database connectors, browser APIs, workers, or
                    other services. Resource changes do not publish state updates. Prefer state for
                    renderable data and resources for operational handles. See the <Code>$res</Code>{' '}
                    property above and <Link to="/advanced">Advanced Patterns</Link>.
                  </ItemDef>

                  <ItemDef title="debug?: boolean">
                    Optional debug flag for development diagnostics. Use it when tracing store
                    behavior locally. Leave it off for normal application behavior so default state
                    stays quiet.
                  </ItemDef>

                  <ItemDef title="subclass?: new (...args: any[]) =&gt; SubClass">
                    Optional class override for branch creation. Use it when a branch should be
                    instantiated as a focused Forest subclass with its own methods. Root stores
                    usually use direct subclass construction instead. The{' '}
                    <Link to="/branching">Branching guide</Link> and{' '}
                    <Link to="/bound-methods">Bound Methods guide</Link> show the related patterns.
                  </ItemDef>

                  <ItemDef title={'branchClasses?: Map<Path, Subclass | undefined>'}>
                    Optional path-to-subclass map. This is the older shorthand for assigning branch
                    classes by path. Prefer <Code>branchParams</Code> for new work because it can
                    define subclass, schema, tests, prep, resources, and path filtering together.
                    The <Link to="/branching">Branching guide</Link> shows the current branch setup
                    API.
                  </ItemDef>

                  <ItemDef title={'branchParams?: Map<Path, BranchConfigParams | undefined>'}>
                    Optional branch defaults by path. Use this when branch setup should be declared
                    once in the root constructor instead of repeated every time a branch is created.
                    Path keys may target specific branches or use <Code>*</Code> as a wildcard
                    default. The <Link to="/branching">Branching guide</Link> and{' '}
                    <Link to="/api#forest-branching">Branching Methods</Link> API section show the
                    branch creation flow.
                  </ItemDef>

                  <ItemDef title="path?: Path; parent?: StoreIF&lt;unknown&gt;">
                    Internal branch linkage. These identify where a branch sits under its parent
                    store. Application code usually creates branches through <Code>$br.$add</Code>,{' '}
                    <Code>$br.$get</Code>, or <Code>$branch</Code>, not by passing these directly.
                    The <Link to="/branching">Branching guide</Link> covers the public branch APIs.
                  </ItemDef>

                  <ItemDef title="BranchConfigParams&lt;DataType, SubClass&gt;">
                    Branch-specific configuration used inside <Code>branchParams</Code>. It supports
                    the same optional behavior layers as <Code>StoreParams</Code> except
                    <Code>value</Code>. Supported entries include <Code>schema</Code>,{' '}
                    <Code>tests</Code>, <Code>prep</Code>, <Code>resources</Code>,{' '}
                    <Code>filterPath</Code>, <Code>name</Code>, <Code>debug</Code>, <Code>res</Code>
                    , and <Code>subclass</Code>. Branch values always come from the parent path.
                  </ItemDef>
                </VStack>
                <Box>
                  Note: branch content is always determined by the branch path. Branch constructors
                  do not require <Code>value</Code>, and they ignore it when present.
                </Box>
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
                    String (<code>user.id</code>) or array (<code>['user', 'id']</code>)
                    representing a path. Path arrays may include non-string keys for Maps. See the
                    <Link to="/api#path">Path</Link> section for usage details.
                  </ItemDef>

                  <ItemDef title="PathFilterFn&lt;DataType&gt;">
                    <Code>(path: Path, store: StoreIF&lt;DataType&gt;) =&gt; Path</Code>. Function
                    that normalizes paths before <Code>get</Code>, <Code>set</Code>, and path-scoped{' '}
                    <Code>mutate</Code>. Optional. Use it to convert caller-facing aliases to array
                    indexes or referential Map keys.
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
