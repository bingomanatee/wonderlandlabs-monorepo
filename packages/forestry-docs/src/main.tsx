import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './pages/home/Home.tsx';
import * as styles from './index.css';
import { Chakra } from './lib/chakra/chakra.tsx';
console.log('styles imprted as', styles);

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { Journaled } from './pages/concepts/Journaled/Journaled.tsx';
import { Concepts } from './pages/concepts/ConceptsLayout.tsx';
import { Transactional } from './pages/concepts/Transactional/Transactional.tsx';
import { Base } from './pages/Base.tsx';
import { Observable } from './pages/concepts/Observable/Observable.tsx';
import { Synchronous } from './pages/concepts/Synchronous/Synchronous.tsx';
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
        children: [
          {
            path: 'journaled',
            element: <Journaled />,
          },

          {
            path: 'transactional',
            element: <Transactional />,
          },
          {
            path: 'observable',
            element: <Observable />,
          },
          {
            path: 'synchronous',
            element: <Synchronous />,
          },
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
