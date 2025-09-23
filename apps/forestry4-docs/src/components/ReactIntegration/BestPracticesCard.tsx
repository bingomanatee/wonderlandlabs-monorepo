import React from 'react';
import { Code, Heading, Text, VStack } from '@chakra-ui/react';
import Section from '../Section';
import { DoDont, DoList, DoItem, DontList, DontItem } from '../DoDont';

const BestPracticesCard: React.FC = () => {
  return (
    <Section>
      <VStack layerStyle="section">
        <Heading size="lg">React Integration Best Practices</Heading>
        <Text>
          React is "quirky" about some features; the hooks above take care of all these concerns but
          if you plan to integrate Forestry with your own code or custom hooks follow these
          guidelines.
        </Text>

        <DoDont>
          <DoList>
            <DoItem title="Use Forestry hooks to reduce blend boilerplate">
              You can subscribe in useEffect and store stores in ref -- but the hooks take care
              of a lot of housekeeping. At this point the hooks are not in the component -
              you'll have to bring the in, because it frees you to use your current react
              version (or Preact or whatever)
            </DoItem>

            <DoItem title="Trust referential integrity">
              given all parts of a store changes when part of it changes, you can trust any part
              of the store in dependency arrays to properly trigger useEffect
            </DoItem>

            <DoItem title="Diminish Hooks whenever possible">
              Using store values or selector actions reduces the number of callbacks or memos
              you have to put in your component body.
            </DoItem>

            <DoItem title="Pass whole stores via context or params">
              Rather than deconstructing actions or values down deep paths, pass the whole store
              and its value down or through context.
            </DoItem>
          </DoList>

          <DontList title="❌ Things that will not work well">
            <DontItem title="Mutate store values directly">
              Immer won't let you do that - use mutate or set to alter parts or all of the store
              value.
            </DontItem>

            <DontItem title="Create stores in component function body">
              If you don't use the factory hooks, create stores in memos or via careful use of
              refs.
            </DontItem>

            <DontItem title="Pass methods and values through multiple properties">
              It's not that it won't work - but passing value and store directly makes it much
              easier to track and debug issues and makes your code much easier to read.
            </DontItem>

            <DontItem title="use useEffect on store values">
              If you want to react to store changes use
              <Code style={{ background: 'transparent', whiteSpace: 'pre' }}>
                {`
myStore.$subject.pipe(
  distinctUntilChanged(
    isEqual,
    (value) => value.cartItems
    )
).subscribe((value) => console.log('cart items changed'));
                `}
              </Code>
              It's faster than useEffect, doesn't have any of the double-call issues, and allows
              you to further update state without requiring a second render cycle. This also
              gives you access to nuance from RxJS including debounce and throttle.
            </DontItem>
          </DontList>
        </DoDont>
      </VStack>
    </Section>
  );
};

export default BestPracticesCard;
