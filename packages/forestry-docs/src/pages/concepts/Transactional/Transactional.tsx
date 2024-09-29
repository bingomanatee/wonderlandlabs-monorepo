import Summary from './summary.mdx';
import Content from './content.mdx';
import { ConceptPage } from '../ConceptPage';

export default function Transactional({ name }: { name: string }) {
  return (
    <ConceptPage summary={Summary} name={name}>
      <Content />
    </ConceptPage>
  );
}
