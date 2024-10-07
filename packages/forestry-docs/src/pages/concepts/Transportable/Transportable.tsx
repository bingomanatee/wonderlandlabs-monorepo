import Summary from './summary.mdx';
import Content from './content.mdx';
import UnitTest from './UnitTest.mdx';
import { ConceptPage } from '../ConceptPage';

export default function Transportable({ name }: { name: string }) {
  return (
    <ConceptPage summary={Summary} name={name}>
      <Content />
      <UnitTest />
    </ConceptPage>
  );
}
