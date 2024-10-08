import { type FC, lazy, ReactNode, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './pages/home/Home.tsx';
import './index.css';
import { Chakra } from './lib/chakra/chakra.tsx';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Concepts } from './pages/concepts/ConceptsLayout.tsx';
import { Base } from './pages/Base.tsx';

import { conceptsState } from './pages/concepts/concepts.state.ts';
import { upperFirst } from 'lodash-es';
import ApiBase from './pages/api/ApiLayout.tsx';
import ApiMenu from './pages/api/ApiMenu.tsx';
import { Named } from './named.tsx';
import { pageState } from './pages/pageState.ts';

const conceptComponents = conceptsState.value.concepts.reduce(
  (acc, concept) => {
    acc[concept.name] = lazy(
      () => import(`./pages/concepts/${upperFirst(concept.name)}/${upperFirst(concept.name)}.tsx`)
    );
    return acc;
  },
  {} as Record<string, FC>
);

type Route = { path: string; element: ReactNode };

const apiPageDefs = pageState.pages().filter((p) => p.parent === 'api');
// @ts-expect-error TS2740
const apiPages: Route[] = apiPageDefs.reduce(
  // @ts-expect-error TS2740
  (out, page) => {
    if (page.url === '') return out;
    const path = pageState.fileFor(page);
    const url = pageState.pageUrl(page);
    console.log('making route for ', url, 'with file ', path);
    console.log('-----importing', path, 'for page', page);
    const Page = lazy(() => import(`${path}`));
    return [
      ...out,
      {
        path: url,
        element: (
          <Suspense fallback={<div>loading...</div>}>
            <Page page={page} />
          </Suspense>
        ),
      },
    ];
  },
  [] as Route[]
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
                {Component ? (
                  <Named Component={Component} name={concept.name} />
                ) : (
                  <div>Component not found</div>
                )}
              </Suspense>
            ),
          };
        }) as { path: string; element: JSX.Element }[],
      },
      {
        path: 'api',
        element: <ApiBase />,
        children: [
          {
            path: '',
            element: <ApiMenu />,
          },
          ...apiPages,
        ],
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
