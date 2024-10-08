import { useEffect } from 'react';
import { PageDef } from '../../pageState.ts';

export default function ApiPage({ page }: { page: PageDef }) {
  useEffect(() => {}, [page]);
}
