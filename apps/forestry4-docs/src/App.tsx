import { Route, Routes } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navigation from './components/Navigation';
import NavigationLanding from './pages/NavigationLanding';
import { navigationSections } from './navigation/sections';

// Getting Started
import Home from './pages/Home';
import WhyForestry from './pages/WhyForestry';

// Essential Features
import StoreBasics from './pages/StoreBasics';
import ChangeValue from './pages/ChangeValue.tsx';
import Branching from './pages/Branching';
import ReactIntegration from './pages/ReactIntegration';
import OtherFrameworks from './pages/OtherFrameworks';

// Power Tools
import ValidationSystem from './pages/ValidationSystem';
import SchemaValidation from './pages/SchemaValidation';
import Transactions from './pages/Transactions';
import BoundMethods from './pages/BoundMethods';
import RxJSIntegration from './pages/RxJSIntegration';
import AdvancedPatterns from './pages/AdvancedPatterns';

// Reference
import APIReference from './pages/APIReference';
import Changelog from './pages/Changelog';
import Examples from './pages/Examples';
import ReadWriteArchitecture, {
  readWritePath,
} from './pages/related/ReadWriteArchitecture';
import ModuleApiPage from './pages/related/ModuleApiPage';
import { moduleApiPath } from './pages/related/api/shared';

import {
  RelatedModulePage,
  RelatedModules,
} from './pages/related/RelatedModules';
import {
  companionModules,
  relatedPath,
  relatedRoot,
} from './pages/related/modules';

// Practical Examples
import TodoApp from './pages/examples/TodoApp';
import ShoppingCart from './pages/examples/ShoppingCart';
import FormValidation from './pages/examples/FormValidation';
import TransactionDemo from './pages/examples/TransactionDemo';

function App() {
  return (
    <Box minH="100vh">
      <Navigation />
      <Box as="main" pt="80px">
        <Routes>
          {navigationSections.map((section) => (
            <Route
              key={section.path}
              path={section.path}
              element={<NavigationLanding section={section} />}
            />
          ))}
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
          <Route path="/branching" element={<Branching />} />
          <Route path="/validation" element={<ValidationSystem />} />
          <Route path="/schemas" element={<SchemaValidation />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/bound-methods" element={<BoundMethods />} />
          <Route path="/rxjs" element={<RxJSIntegration />} />
          <Route path="/advanced" element={<AdvancedPatterns />} />

          {/* Practical Examples */}
          <Route path="/examples/todo-app" element={<TodoApp />} />
          <Route path="/examples/shopping-cart" element={<ShoppingCart />} />
          <Route path="/examples/form-validation" element={<FormValidation />} />
          <Route path="/examples/transaction-demo" element={<TransactionDemo />} />

          <Route
            path={readWritePath}
            element={<ReadWriteArchitecture />}
          />
          <Route path={relatedRoot} element={<RelatedModules />} />
          {companionModules.map((module) => (
            <Route
              key={module.slug}
              path={relatedPath(module)}
              element={<RelatedModulePage module={module} />}
            />
          ))}

          {companionModules.map((module) => (
            <Route
              key={moduleApiPath(module.slug)}
              path={moduleApiPath(module.slug)}
              element={<ModuleApiPage module={module} />}
            />
          ))}

          {/* Reference */}
          <Route path="/api" element={<APIReference />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/examples" element={<Examples />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
