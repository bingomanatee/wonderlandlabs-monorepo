import Summary from './summary.mdx';
import Content from './content.mdx';
import BuyEggsAndHam from './BuyEggsAndHam.mdx';
import Content2 from './content2.mdx';
import Content3 from './content3.mdx';
import BuyEggsAndHamWithForestry from './BuyEggsAndHamWithForestry.mdx';
import { ConceptPage } from '../ConceptPage';

export default function Synchronous({ name }: { name: string }) {
  return (
    <ConceptPage summary={Summary} name={name}>
      <Content />
      <BuyEggsAndHam />
      <Content2 />
      <BuyEggsAndHamWithForestry />
      <Content3 />
    </ConceptPage>
  );
}
