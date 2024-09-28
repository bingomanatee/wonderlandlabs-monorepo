import Summary from './summary.mdx';
import Content from './content.mdx';
import { ConceptPage } from '../ConceptPage';

console.log('content is ', Content);
export function Synchronous() {
  return (
    <ConceptPage summary={Summary} image="/pictures/synchronous.png" title="Synchronous">
      <Content />
    </ConceptPage>
  );
}
