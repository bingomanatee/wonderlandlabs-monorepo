import React from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Card,
  CardBody,
  Code,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import SnippetBlock from '@/components/SnippetBlock';

const ValidationGuide: React.FC = () => {
  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Heading size="lg">Deeper Thoughts - Validation Troubleshooting Guide</Heading>
          <Text>
            There are basically two modes of validation - "hard" validation that prevents certain
            patterns from ever appearing in state and "soft" validation in which errors and gates
            change based on the validity of certain field(s).
          </Text>
          <Text as="ul" size="sm">
            <li>
              <b>Hard Validation</b> is managed in three different ways in Forest. Every new value
              candidate goes through these
              <ol>
                <li>
                  <code>.pre</code> - a function that "filters" or fixes bad data; it occurs before
                  tests are ran. It accepts a candidate value and returns a (potentially fixed)
                  value. The purpose of pre is to catch "correctable" errors like data sorting,
                  stringy numbers, or other minor flaws in prospective data. it is not{' '}
                  <i>technically</i> a validator but it may prevent "mostly good" changes from being
                  blocked on correctable issues
                </li>
                <li>
                  <code>.schema</code> - managed by she schema property in the constructor params,
                  it defines a Zod instance to define a schema that the state must follow; its
                  basically parametric typescript - but unlike TS it is actually an enforced ruleset
                  in React that dynamically blocks bad data from being entered in state.
                </li>

                <li>
                  <code>.tests</code> - a function or array of functions that if they return a
                  string or throw, prevent bad data from being saved into state; these test errors
                  will throw to the outer scope; you may want to put catchers around code that might
                  trigger tests. if tests is an array of functions, they are executed in order and
                  any failure blocks subsequent tests from running.
                </li>
              </ol>
            </li>
            <li>
              <b>Soft Validation</b> is encoded in pre or in actions to assert "annotation" on the
              state as a whole or specific fields; it is the sort of thing you expect to work with
              forms where the user is not prevented from entering a bad data, but they are{' '}
              <i>infrormed</i> about the state of their field or form with error messages.
              Obviously, for this to work both the bad data and the error message (and potentially
              an isValid boolean) exist for every field and potentially the form as a whole. there
              are two ways of doing this - embedding these properties in state or writing actions
              such as
              <code>
                isValid(value, fieldName, fieldValue): {`{isValid: boolean, error? string}`}{' '}
              </code>
              or <code>isEmailValid(): {`{isValid: boolean, error? string}`}</code>
            </li>
          </Text>

          <Box layerStyle="infoBox" bg="blue.50">
            <Heading size="sm">🤔 In short:</Heading>
            <VStack spacing={2} align="start" fontSize="sm">
              <Text>
                <strong>Transient ("soft") UI Feedback/ data correction</strong> → Use{' '}
                <Code>prep</Code>
                functions or feedback actions.
              </Text>
              <Text>
                <strong>Type Safety, data prefiltering / sanitation?</strong> → Use <Code>Zod</Code>{' '}
                schema validation for "dynamic typescript like" format enforcement
              </Text>
              <Text>
                <strong>Complex Business Rules?</strong> → Use <Code>tests</Code> function(s)
              </Text>
            </VStack>
            <Text size="sm">
              again - data updating occurs <b>in this order</b>; if it matters, for instance, you
              can trust that your candidates conform to your schema before executing your tests.
            </Text>
          </Box>

          <Box layerStyle="infoBox" bg="gray.50">
            <Heading size="sm">📚 Complete Example - All Three Layers:</Heading>
            <Text fontSize="sm" mb={3}>
              A shopping cart that uses Zod for structure, tests for business rules, and prep for UI
              state:
            </Text>
            <SnippetBlock snippetName="shoppingCartValidation" folder="ValidationSystem" />
          </Box>

          <Box layerStyle="infoBox" bg="gray.50">
            <Heading size="sm">Do I have to use Zod?</Heading>
            <Text>
              Technically the schema parameter expects an object with a parse(value) method that
              throws on bad code. If you don't want to pull in Zod you can put any other / a custom
              parser in to schema as long as it exposes a parse method; if it doesn't create an
              object and a parse method and enclose your validator inside of it. (FWIW Zod is not
              bundled with Forestry so this option may appeal if you are fanatic about bundle size
              reduction.)
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ValidationGuide;
