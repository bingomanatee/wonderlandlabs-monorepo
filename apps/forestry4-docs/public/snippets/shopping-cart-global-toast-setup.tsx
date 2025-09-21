// Auto-generated snippet from: apps/forestry4-docs/src/examples/shopping-cart/global-toast-setup.tsx
// Description: Global toast configuration for shopping cart error handling
// Last synced: Sun Sep 21 14:32:36 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// main.tsx - Global toast configuration
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import App from './App';
import theme from './theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChakraProvider
    theme={theme}
    toastOptions={{
      defaultOptions: {
        position: 'top-right',
        duration: 4000
      }
    }}
  >
    <App />
  </ChakraProvider>
);
