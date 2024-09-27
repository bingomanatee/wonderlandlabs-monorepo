import Summary from './summary.mdx';
import Content from './content.mdx';
import { ConceptPage } from '../ConceptPage';

console.log('content is ', Content);
export function Journaled() {
  return (
    <ConceptPage summary={Summary} image="/pictures/journaling.png" title="Journaled">
      <Content />
    </ConceptPage>
  );
}
