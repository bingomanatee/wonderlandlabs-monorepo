import Summary from './summary.mdx';
import Content from './content.mdx';
import Content2 from './content2.mdx';
import Example from './example.mdx';
import { ConceptPage } from '../ConceptPage';

export default function React({ name }: { name: string }) {
  return (
    <ConceptPage summary={Summary} name={name}>
      <Content />
      <Content2 />
      <Example />
    </ConceptPage>
  );
}
