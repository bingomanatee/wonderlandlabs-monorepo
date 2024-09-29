import Summary from './summary.mdx';
import Content from './content.mdx';
import { ConceptPage } from '../ConceptPage';

export function Typescript() {
  return (
    <ConceptPage summary={Summary} image="/pictures/typescript.png" 
    title="Typescript">
      <Content />
    </ConceptPage>
  );
}
