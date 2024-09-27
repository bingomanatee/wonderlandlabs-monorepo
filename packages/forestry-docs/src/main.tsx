import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/home/Home.tsx';
import * as styles from './index.css';
import { Chakra } from './lib/chakra/chakra.tsx';
console.log('styles imprted as', styles);

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { Journaled } from './pages/concepts/Journaled/Journaled.tsx';
import { Concepts } from './pages/concepts/ConceptsLayout.tsx';
import { Transactional } from './pages/concepts/Transactional/Transactional.tsx';
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: 'concepts',
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
