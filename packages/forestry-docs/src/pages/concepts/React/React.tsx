import Summary from './summary.mdx';
import Content from './content.mdx';
import Content2 from './content2.mdx';
import Content3 from './content3.mdx';
import Content4 from './content4.mdx';
import { ConceptPage } from '../ConceptPage';

export default function React({ name }: { name: string }) {
  return (
    <ConceptPage summary={Summary} name={name}>
      <Content />
      <Content2 />
      <Content3 />
      <Content4 />
    </ConceptPage>
  );
}
