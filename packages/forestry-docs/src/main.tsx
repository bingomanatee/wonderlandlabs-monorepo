import { lazy, StrictMode, Suspense, type FC } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './pages/home/Home.tsx';
import * as styles from './index.css';
import { Chakra } from './lib/chakra/chakra.tsx';
console.log('styles imprted as', styles);

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { Concepts } from './pages/concepts/ConceptsLayout.tsx';
import { Base } from './pages/Base.tsx';

import { conceptsState } from './pages/concepts/concepts.state.ts';
import { upperFirst } from 'lodash-es';
const conceptComponents = conceptsState.value.concepts.reduce(
  (acc, concept) => {
    acc[concept.name] = lazy(
      () => import(`./pages/concepts/${upperFirst(concept.name)}/${upperFirst(concept.name)}.tsx`)
    );
    return acc;
  },
  {} as Record<string, FC>
);

const router = createBrowserRouter([
  {
    path: '',
    element: <Base />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/concepts',
        element: <Concepts />,
        children: conceptsState.value.concepts.map((concept) => {
          const Component = conceptComponents[concept.name as keyof typeof conceptComponents];
          return {
            path: concept.name,
            element: (
              <Suspense fallback={<div>Loading...</div>}>
                {Component ? <Component name={concept.name} /> : <div>Component not found</div>}
              </Suspense>
            ),
          };
        }) as { path: string; element: JSX.Element }[],
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Chakra>
      <RouterProvider router={router} />
    </Chakra>
  </StrictMode>
);
