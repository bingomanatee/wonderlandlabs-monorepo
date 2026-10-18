import { useEffect } from 'react';
import { Box, Container, Image, Link, ListItem, OrderedList, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import PageTitle from '../../components/PageTitle';
import CodePanel from '../../components/CodePanel';
import Section from '../../components/Section';
import PendingIndicatorDemo from './PendingIndicatorDemo';
import PendingNoticeDemo from './PendingNoticeDemo';

export const readWritePath = '/guides/read-write';
const singleDiagramPath = '/img/data-core-single.svg';
const diagramPath = '/img/data-core.svg';

function ArchitectureDiagram({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <Box as="figure" m={0}>
      <Image
        src={src}
        alt={alt}
        display="block"
        width="100%"
        maxW="660px"
        height="auto"
        mx="auto"
        bg="white"
      />
      <Text as="figcaption" mt={3} textAlign="center">
        {caption}
      </Text>
    </Box>
  );
}

export default function ReadWriteArchitecture() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <Container maxW="container.xl" py={8}>
      <Link as={RouterLink} to="/related-modules/data-core">
        DataCore
      </Link>
      <PageTitle
        title="Single and Double Layer DataCore"
        subtitle="Save in the app first; add a worker as the work grows."
      />
      <VStack layerStyle="section" spacing={8}>
        <Section title="Single layer: the app loads and saves">
          <Text>
            Start here for a simple project. Only one version of the data is tracked and all the
            global action happens in a single context.
          </Text>
          <OrderedList textStyle="body" spacing={2}>
            <ListItem>
              The app gets records from the server, and keeps them in a Data Manager
            </ListItem>
            <ListItem>
              When the user edits a record, it edits a local copy and sends it back to the global
              DataManager
            </ListItem>
            <ListItem>The data manager sends a write request through its connection.</ListItem>
          </OrderedList>
          <ArchitectureDiagram
            src={singleDiagramPath}
            alt={
              'Single layer: the app reads collections from one Data ' +
              'Manager. A form edits a copy and saves through the same ' +
              'manager’s connection to the server.'
            }
            caption="One app loads records, shows edits and sends saves."
          />
          <Text>For example, a user opens a book form and changes its title.</Text>
          <OrderedList textStyle="body" spacing={2}>
            <ListItem>
              The form edits a copy, so unfinished typing does not change the title elsewhere.
            </ListItem>
            <ListItem>
              On Save, the app shows the new title immediately and sends it to the server.
            </ListItem>
          </OrderedList>
          <Text>The user can keep working while the request finishes.</Text>
          <Text>
            This can remain enough for a small app. It can also collect several edits and send them
            together. Saving in the app does not mean freezing the screen while it waits for the
            server. The downside is that the write code and the React code share the same thread;
            large data updates or retries may degrade performance. Batching is possible in either
            setup; a worker gives it a separate place to run.
          </Text>
        </Section>
        <Section title="Double layer: a worker handles the saves">
          <Text>
            As the project grows, preparing frequent saves can take time away from drawing the
            screen and responding to clicks. A Web Worker gives that saving work a separate place to
            run in the browser.
          </Text>
          <OrderedList textStyle="body" spacing={2}>
            <ListItem>
              The app gets records from the server and keeps them in its Data Manager for the screen
              to use.
            </ListItem>
            <ListItem>
              The user edits a local copy. On Save, the app shows the change immediately and sends a
              copy to the worker.
            </ListItem>
            <ListItem>
              The worker collects changes waiting to be sent and saves them together through its own
              Data Manager and connection.
            </ListItem>
            <ListItem>
              After the server confirms the save, the worker tells the app which request succeeded.
              Failed saves can be retried there too.
            </ListItem>
          </OrderedList>
          <ArchitectureDiagram
            src={diagramPath}
            alt={
              'Double layer: the app loads records and shows edits. It ' +
              'passes copies of changes to a Web Worker, which collects ' +
              'them and sends saves through its own Data Manager.'
            }
            caption="The app handles the screen; the worker collects and saves."
          />
          <Text>For example, the user changes the same book title.</Text>
          <OrderedList textStyle="body" spacing={2}>
            <ListItem>The form edits a local copy of the data.</ListItem>
            <ListItem>
              On Save, the app (optimistically) shows the new title straight away and passes the
              edited record to the worker.
            </ListItem>
            <ListItem>
              The debounced worker will send the changes to the server along with any other pending
              edits..
            </ListItem>
            <ListItem>The server saves the changes.</ListItem>
            <ListItem>
              The worker receives the confirmation and erases the pending records that were written.
            </ListItem>
            <ListItem>
              Optionally if the update message sends data back it is patched into the client data as
              well.
            </ListItem>
          </OrderedList>
          <Text>
            The user can keep working throughout. The result for the user is fewer network
            transmissions and insulation from minor socket interruptions that can be fixed on retry.
            Pushing saving to a worker thread means the general UX thread can operate faster as
            well.
          </Text>
        </Section>
        <Section title="When to add the second layer">
          <Text>
            Use one layer while it keeps the app responsive. Consider a worker when preparing
            frequent or large saves starts making typing, scrolling or other interactions feel slow.
            Try the same editing session with each approach and check whether the screen responds
            better and the server receives fewer requests.
          </Text>
          <Text>
            A worker does not make the server or network faster. Its benefit is giving the app less
            saving work to do alongside the screen. You can begin with direct saves and later send
            that work to a worker, keeping the same forms and immediate response to edits.
          </Text>
          <Text>
            One situation where changes need buffering is a drawing app or a charting system; in our
            case it was using react flow with a complex set of nodes and lines which were created
            and repositioned; the thread interrupt for the saving mechanic was making the
            application feel sluggish and badly designed.
          </Text>
        </Section>
        <Section
          title="Forms and editors save at different moments"
          id="forms-and-editors-save-at-different-moments"
          scrollMarginTop="80px"
        >
          <Text>
            A form opened in a dialog edits its own copy of a record. Until the user presses Save,
            the rest of the app keeps showing the original. Cancel throws away the draft. Save
            checks the fields, updates what the app shows and schedules a server save.
          </Text>
          <Text>
            An editor that stays on screen can show changes as the user types. Wait for a short
            pause before sending them, so a sentence does not produce a request for every letter.
            Also send after a time limit or when enough edits have collected, even if the user keeps
            typing.
          </Text>
          <Text>
            Both approaches work with either diagram. A worker changes where saving happens; it does
            not change when the user sees their edit.
          </Text>
        </Section>
        <Section
          title="Let users know when edits still need saving"
          id="pending-edits-before-leaving"
          scrollMarginTop="80px"
        >
          <Text>
            Waiting for a pause in typing cuts down on save requests, but it
            leaves a short gap between an edit and sending it. There is a
            small but real risk that a user closes the site during that gap
            and the last changes never reach the server. Moving saves to a
            worker does not guarantee they will finish after the tab closes.
          </Text>
          <Text>
            A form with an explicit Save button gives the user a clear action
            to complete. They are responsible for pressing Save before leaving
            the form; the app is responsible for showing whether that save
            succeeded. Pressing the button alone does not mean the server has
            received the change.
          </Text>
          <Text>
            An editor that stays on screen and saves as the user types has no
            such handoff. The user can reasonably assume their work is already
            saved. This is a common reason to use two layers, and it makes
            feedback about unsaved work especially important.
          </Text>
          <Text>
            Show a small pending-data indicator as soon as there are edits
            waiting to save, including the pause before sending them. Keep it
            visible while saves are running or have failed, and hide it only
            when all changes are confirmed saved or deliberately discarded.
            Explain that the icon means the page should stay open until saving
            finishes. A local recovery copy can protect edits if the user still
            leaves; the icon itself does not prevent data loss.
          </Text>
          <Text>
            The{' '}
            <Link
              as={RouterLink}
              to="/related-modules/data-core#showing-pending-saves"
            >
              pending-data indicator
            </Link>{' '}
            is bundled with DataCore as a plain JavaScript utility. It shows
            a spinning icon in the lower right, with a still number in the
            middle showing how many records have unsaved changes. Your app
            supplies the count and updates it as records are saved. Zero hides
            the icon. Its size, hue and spinning speed are configurable, and it
            needs no React dependency.
          </Text>
          <Text>
            Try it with three unsaved records. This preview disappears after
            three seconds. Each click picks a new size and hue to demonstrate
            customization. The spinner uses light and dark parts (85% and 15%
            lightness) to stay visible on light and dark backgrounds. In your
            app, keep it visible until saving finishes.
          </Text>
          <Text>
            This helper takes the unsaved-record count and appearance options,
            then returns a function that removes its spinner. Call that
            function after the pending work is saved or deliberately discarded.
            Removing the spinner does not cancel a save or mark records saved.
          </Text>
          <CodePanel
            language="javascript"
            content={`import {
  createPendingIndicator,
} from '@wonderlandlabs/forestry-data-core/pending-indicator';

function showPendingRecords(count, appearance = {}) {
  const indicator = createPendingIndicator(appearance);
  indicator.setPending(count);
  return () => indicator.destroy();
}

const cancelSpinner = showPendingRecords(3, {
  scale: 0.75, // 48px across (the original icon is 64px).
  speed: 1,    // One turn per second.
  hue: 210,    // Base color in degrees.
});

// Once all pending records are saved or deliberately discarded:
cancelSpinner();`}
          />
          <PendingIndicatorDemo />
        </Section>
        <Section
          title="Explain the icon the first time"
          id="explain-pending-icon"
          scrollMarginTop="80px"
        >
          <Text>
            DataCore also includes a plain JavaScript dialog that explains
            the spinner and asks the user to keep the page open while changes
            are unsaved. Call it when your app first has pending work. The
            user can choose “Don’t show this again”; that choice is remembered
            for this site in their browser after they dismiss the dialog.
            The spinner still appears normally after the explanation is hidden.
          </Text>
          <CodePanel
            language="javascript"
            content={`import {
  createPendingIndicator,
  showPendingNotice,
} from '@wonderlandlabs/forestry-data-core/pending-indicator';

const indicator = createPendingIndicator({ scale: 0.75, hue: 210 });
indicator.setPending(3);
const closeExplanation = showPendingNotice();

// After all pending records are saved or deliberately discarded:
indicator.destroy();
closeExplanation(); // Safe even if the user already closed the dialog.`}
          />
          <Text>
            The button below opens the explanation. If you select “Don’t show
            this again,” later calls skip it. Closing the dialog does not hide
            the spinner, save records or prevent the user from leaving the
            page. If browser storage is blocked, the dialog still works but
            the preference may not survive another visit.
          </Text>
          <PendingNoticeDemo />
        </Section>
        <Section
          title="What happens after Save?"
          id="what-happens-after-save"
          scrollMarginTop="80px"
        >
          <Text>
            The app remembers exactly what it sent. If the user changes the title again while that
            save is running, the first success confirms only the earlier title. The newer edit still
            needs to be saved.
          </Text>
          <Text>
            If a save fails, keep the edit available to try again. With a worker, the worker reports
            success only after the server confirms it saved the data. Receiving a message from the
            app is not enough. Choose one place to handle retries so the app and worker do not both
            repeat the same request independently.
          </Text>
          <Text>
            An explicit Save can show a brief success message when finished. Routine background
            saves can stay quiet. Keeping edits through a page reload needs separate local storage;
            neither arrangement does that automatically.
          </Text>
        </Section>
        <Section
          title="When the server sends the record back"
          id="when-the-server-sends-the-record-back"
          scrollMarginTop="80px"
        >
          <Text>
            After saving, the server may send the same title back with a slightly different
            updatedAt time. If all the meaningful fields match, the app can keep what it already
            shows instead of replacing the record and updating the screen again. The
            recordComparator option lets the application decide which differences are harmless.
          </Text>
          <Text>
            A different title is a real change, even if its timestamp is close. Keep unsaved local
            edits protected until the application decides whether to keep them or accept the
            server’s copy.
          </Text>
          <Text>
            If the user abandons work that has not started saving, abortPending can remove those
            waiting requests. Saves already running and failed saves waiting to retry continue.
            Receiving a server update does not automatically cancel a save.
          </Text>
        </Section>
        <Section title="Using DataCore">
          <Text>
            <Link as={RouterLink} to="/related-modules/data-core">
              DataCore guide
            </Link>{' '}
            explains loading records, remembering edits and saving them. The{' '}
            <Link as={RouterLink} to="/related-modules/data-core/api">
              DataCore API
            </Link>{' '}
            lists methods and options. See{' '}
            <Link as={RouterLink} to="/related-modules/connections">
              Data Connections
            </Link>{' '}
            for connecting to a server.
          </Text>
        </Section>
      </VStack>
    </Container>
  );
}
