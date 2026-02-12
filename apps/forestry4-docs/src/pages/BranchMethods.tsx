import React from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Container,
  Heading,
  HStack,
  ListItem,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import CodePanel from '../components/CodePanel';
import ItemDef from '../components/ItemDef';
import Section from '../components/Section';

const BranchMethods: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading variant="page">Branch Methods</Heading>
          <Text textStyle="hero">
            Branches are "sub-stores" that have methods focused on a sub-part of the store.
            "Sub-parts" can be either object keys or Map items.
          </Text>
        </Box>

        <VStack align="start" spacing={2} fontSize="sm">
          <HStack align="start">
            <Text>✅</Text>
            <Text>
              Branches allow you to write methods specific to subsets of the branch data. Stores can
              be arbitrarily deep - you never <i>have</i> to create branches to manage deep data
              states. However you may find it useful to have subset-centric Branch stores to allow
              focused attention and distribute the code in your store to focus on relevant data.
            </Text>
          </HStack>
          <HStack align="start">
            <Text>✅</Text>
            <Text>
              Branches are intended for "stable" stores where their paths are modified but never
              deleted in practice. Deleting a branches' basis path will lock (<code>complete()</code>)
              the store and create usage issues. Similarly a branch whose path is undefined will not
              function and may be unpredictable.
            </Text>
          </HStack>
          <HStack align="start">
            <Text>✅</Text>
            <Text>
              Updating a branch will cause its parent to broadcast but not (necessarily) the other
              way around.
            </Text>
          </HStack>
          <HStack align="start">
            <Text>✅</Text>
            <Text>
              The subset of data managed by a branch is identical - in value and in reference - to
              the subset of data in the parent that the branch references.
            </Text>
          </HStack>
          <HStack align="start">
            <Text>✅</Text>
            <Text>
              Branches can be several levels deep; i.e., you can branch on{' '}
              <code>['contents','intro']</code>to branch on a subset of the parent data two levels
              down.
            </Text>
          </HStack>
          <HStack align="start">
            <Text>✅</Text>
            <Text>
              None of the methods of <code>.$br</code> should <i>change</i> the data it wraps;
              adding or deleting branches add functionality but should not transform data.
            </Text>
          </HStack>
          <HStack align="start">
            <Text>✅</Text>
            <Text>
              A branch can be created without a specific sub-class. It will be a generic Forest
              instance; its not a great use of branches but it is acceptable.
            </Text>
          </HStack>
        </VStack>

        <Section title="Quick Start">
          <Text textStyle="body">
            Use <code>$br.$add(path, params)</code> for explicit branch creation and{' '}
            <code>$br.$get(path)</code> for lazy creation. The old way of creating branches was{' '}
            <code>$branch(...)</code>; this is deprecated.
          </Text>

          <Text textStyle="body" mt={4}>
            The <code>branchParams</code> map lets branches resolve subclass, schema, prep, and
            other branch defaults without repeating them in every call.
          </Text>

          <CodePanel
            title="Modern Branch API"
            language="typescript"
            snippetName="modernBranchRegistryApi"
            folder="Branching"
          />
        </Section>

        <Section title="Constructor Configuration">
          <ItemDef title="branchParams?: Map<Path, BranchParams | undefined>" titleAsCode={true}>
            Optional branch defaults map used when creating branches. Keys are normalized path
            strings. Add this as a constructor parameter to define subclass, schema, prep, or other
            defaults per path. <code>*</code> acts as a wildcard for unresolved paths.
          </ItemDef>
        </Section>

        <Section title="Branch Registry API">
          <Text textStyle="body" mb={3}>
            Shared setup for the examples below:
          </Text>
          <CodePanel
            title="Shared Example Setup"
            language="typescript"
            snippetName="branchMethodSetup"
            folder="Branching"
          />

          <ItemDef
            title="get $br(): Branches"
            titleAsCode={true}
            snippetName="brAccessor"
            snippetFolder="Branching"
            codeTitle="Using $br"
          >
            Shorthand accessor for the branch registry on a Forest instance. the plain get method
            <b>will not lazily-instantiate</b> a branch - it only returns previously instantiated
            branches.
          </ItemDef>

          <ItemDef
            title="$br.$add<ValueType, Subclass>(path, params): Subclass"
            titleAsCode={true}
            snippetName="brAdd"
            snippetFolder="Branching"
            codeTitle="$br.$add Example"
          >
            Creates and stores a branch. <code>params</code> should not include <code>value</code> -
            the value will always come from parent data at <code>path</code>. However other
            arguments such as schema, prep, etc. can be passed to the parameters. Throws if the
            branch path resolves to undefined.
          </ItemDef>

          <ItemDef
            title="$br.$get<ValueType, Subclass>(path): Subclass | undefined"
            titleAsCode={true}
            snippetName="brLazyGet"
            snippetFolder="Branching"
            codeTitle="$br.$get Example"
          >
            Lazy lookup: returns existing branch, or creates one if parent data exists at path.
            Returns <code>undefined</code> if the parent path value is undefined.
          </ItemDef>

          <ItemDef
            title="$br.get(key: string): StoreIF | undefined"
            titleAsCode={true}
            snippetName="brGet"
            snippetFolder="Branching"
            codeTitle="$br.get Example"
          >
            Standard <code>Map.get</code> behavior. No lazy creation.
          </ItemDef>

          <ItemDef
            title="$br.delete(path): boolean"
            titleAsCode={true}
            snippetName="brDelete"
            snippetFolder="Branching"
            codeTitle="$br.delete Example"
          >
            Removes the branch from the registry and completes it (if still active). note it deletes
            the branch instance -- <b>not the data</b>.
          </ItemDef>
        </Section>

        <Section title="Deprecated Helper">
          <ItemDef
            title="$branch(path, params) // deprecated"
            titleAsCode={true}
            snippetName="branchDeprecated"
            snippetFolder="Branching"
            codeTitle="$branch (Deprecated)"
          >
            Backward-compatible wrapper around <code>$br.$add</code>. Emits a deprecation warning.
          </ItemDef>

          <Text textStyle="body">
            Use <code>$br.get(key)</code> for direct map lookup and <code>$br.delete(path)</code>{' '}
            for ejection/removal.
          </Text>
        </Section>

        <Section title="Subclass Resolution Rules">
          <Text textStyle="body">
            The subclass property of the parameters defines which class the branch is instantiated
            to. its an optional parameter - in its absence, it returns a generic Forest instance.
            The sublass needs to extend (directly or indirectly) Forest. See the example above.
          </Text>
          <UnorderedList textStyle="body" spacing={2}>
            <ListItem>Explicit params subclass (when provided)</ListItem>
            <ListItem>
              <code>branchParams.get(path).subclass</code>
            </ListItem>
            <ListItem>
              <code>branchParams.get('*').subclass</code>
            </ListItem>
            <ListItem>Fallback to plain Forest branch</ListItem>
          </UnorderedList>

          <Alert status="info">
            <AlertIcon />
            <Text>
              If a class is configured but missing or invalid, Forestry warns and falls back to
              plain Forest behavior.
            </Text>
          </Alert>
        </Section>

        <Section title="Related Docs">
          <Text textStyle="body">
            See <Link to="/api#forest-branching">API Reference</Link> for signatures in the broader
            Forest API, and <Link to="/store-basics">Store Basics</Link> for base store behavior.
          </Text>
        </Section>

        <Section title="Return value by method and resources">
          <Text textStyle="body" mb={3}>
            Use this quick matrix to choose between <code>$br.get</code>, <code>$br.$get</code>, and{' '}
            <code>$br.$add</code> based on branch state and configured defaults.
          </Text>
          <TableContainer width="100%" whiteSpace="normal">
            <Table variant="simple" size="sm" width="100%">
              <Thead>
                <Tr>
                  <Th>Method</Th>
                  <Th>Already created</Th>
                  <Th>BranchParams exist*</Th>
                  <Th>branchParams do not exist</Th>
                  <Th>branch path points to undefined data</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>
                    <code>$br.get(path)</code>
                  </Td>
                  <Td color="green.600">Existing branch.</Td>
                  <Td color="yellow.700">Undefined (no lazy create).</Td>
                  <Td color="yellow.700">Undefined.</Td>
                  <Td color="yellow.700">Undefined.</Td>
                </Tr>
                <Tr>
                  <Td>
                    <code>$br.$get(path)</code>
                  </Td>
                  <Td color="green.600">Existing branch.</Td>
                  <Td color="green.600">Lazy-created branch using path or wildcard defaults.</Td>
                  <Td color="green.600">Lazy-created plain Forest branch.</Td>
                  <Td color="yellow.700">Undefined (no branch created).</Td>
                </Tr>
                <Tr>
                  <Td>
                    <code>$br.$add(path, params)</code>
                  </Td>
                  <Td color="red.600">Duplicate-branch error (throws).</Td>
                  <Td color="green.600">
                    Created branch with merged defaults; explicit params win.
                  </Td>
                  <Td color="green.600">Created branch from params only (or plain Forest).</Td>
                  <Td color="red.600">Undefined-path error (throws).</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
          <Text textStyle="body" fontSize="sm" mt={2}>
            * (for path, or default &quot;*&quot; for any undefined path)
          </Text>
        </Section>
      </VStack>
    </Container>
  );
};

export default BranchMethods;
