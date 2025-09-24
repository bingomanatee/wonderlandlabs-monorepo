import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navigation from './components/Navigation';

// Getting Started
import Home from './pages/Home';
import WhyForestry from './pages/WhyForestry';

// Essential Features
import StoreBasics from './pages/StoreBasics';
import ChangeValue from './pages/ChangeValue.tsx';
import ReactIntegration from './pages/ReactIntegration';
import OtherFrameworks from './pages/OtherFrameworks';

// Power Tools
import ValidationSystem from './pages/ValidationSystem';
import SchemaValidation from './pages/SchemaValidation';
import Transactions from './pages/Transactions';
import RxJSIntegration from './pages/RxJSIntegration';
import AdvancedPatterns from './pages/AdvancedPatterns';

// Reference
import APIReference from './pages/APIReference';
import Examples from './pages/Examples';

// Practical Examples
import TodoApp from './pages/examples/TodoApp';
import ShoppingCart from './pages/examples/ShoppingCart';
import FormValidation from './pages/examples/FormValidation';
import TransactionDemo from './pages/examples/TransactionDemo';

function App() {
  return (
    <Box minH="100vh">
      <Navigation />
      <Box as="main" pt="120px">
        <Routes>
          {/* Getting Started */}
          <Route path="/" element={<Home />} />
          <Route path="/why" element={<WhyForestry />} />
          <Route path="/store" element={<StoreBasics />} />

          {/* Essential Features */}
          <Route path="/forest" element={<StoreBasics />} />
          <Route path="/change" element={<ChangeValue />} />
          <Route path="/react" element={<ReactIntegration />} />
          <Route path="/other-frameworks" element={<OtherFrameworks />} />

          {/* Power Tools */}
          <Route path="/validation" element={<ValidationSystem />} />
          <Route path="/schemas" element={<SchemaValidation />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/rxjs" element={<RxJSIntegration />} />
          <Route path="/advanced" element={<AdvancedPatterns />} />

          {/* Practical Examples */}
          <Route path="/examples/todo-app" element={<TodoApp />} />
          <Route path="/examples/shopping-cart" element={<ShoppingCart />} />
          <Route path="/examples/form-validation" element={<FormValidation />} />
          <Route path="/examples/transaction-demo" element={<TransactionDemo />} />

          {/* Reference */}
          <Route path="/api" element={<APIReference />} />
          <Route path="/examples" element={<Examples />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
