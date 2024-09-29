import Summary from './summary.mdx';
import Content from './content.mdx';
import { ConceptPage } from '../ConceptPage';

export default function Typescript({name}: {name: string}) {
  return (
    <ConceptPage summary={Summary} name={name}
    title="Typescript">
      <Content />
    </ConceptPage>
  );
}
