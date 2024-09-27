import Summary from './summary.mdx';
import Content from './content.mdx';
import { ConceptPage } from '../ConceptPage';

export function Transactional() {
  return (
    <ConceptPage summary={Summary} image="/pictures/tree-rings.png" title="Transactional Fallback">
      <Content />
    </ConceptPage>
  );
}
