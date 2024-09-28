import Summary from './summary.mdx';
import Content from './content.mdx';
import { ConceptPage } from '../ConceptPage';

console.log('content is ', Content);
export function Observable() {
  return (
    <ConceptPage summary={Summary} image="/pictures/observable.png" title="Observable">
      <Content />
    </ConceptPage>
  );
}
