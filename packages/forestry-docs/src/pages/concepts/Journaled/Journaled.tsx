import Summary from './summary.mdx';
import Content from './content.mdx';
import { ConceptPage } from '../ConceptPage';

export function Journaled() {
  return (
    <ConceptPage summary={Summary} image="/pictures/journaled.png" title="Journaled">
      <Content />
    </ConceptPage>
  );
}
