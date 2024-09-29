import Summary from './summary.mdx';
import Content from './content.mdx';
import { ConceptPage } from '../ConceptPage';

export function Transportable() {
  return (
    <ConceptPage summary={Summary} image="/pictures/transportable.png" 
    title="Transportable">
      <Content />
    </ConceptPage>
  );
}
