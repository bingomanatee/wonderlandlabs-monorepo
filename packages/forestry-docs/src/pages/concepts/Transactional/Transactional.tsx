import Summary from './summary.mdx';
import Content from './content.mdx';
import { ConceptPage } from '../ConceptPage';

export function Transactional() {
  return (
    <ConceptPage
      summary={Summary}
      image="/pictures/transactional.png"
      title="Transactional Fallback"
    >
      <Content />
    </ConceptPage>
  );
}
