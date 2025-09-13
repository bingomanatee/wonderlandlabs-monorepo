import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Navigation from './components/Navigation'

// Getting Started
import Home from './pages/Home'
import WhyForestry from './pages/WhyForestry'

// Essential Features
import StoreBasics from './pages/StoreBasics'
import ActionsState from './pages/ActionsState'
import ReactIntegration from './pages/ReactIntegration'

// Power Tools
import ValidationSystem from './pages/ValidationSystem'
import Transactions from './pages/Transactions'
import RxJSIntegration from './pages/RxJSIntegration'
import AdvancedPatterns from './pages/AdvancedPatterns'

// Reference
import APIReference from './pages/APIReference'
import Examples from './pages/Examples'

function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      <Navigation />
      <Box as="main" pt="80px">
        <Routes>
          {/* Getting Started */}
          <Route path="/" element={<Home />} />
          <Route path="/why" element={<WhyForestry />} />

          {/* Essential Features */}
          <Route path="/store" element={<StoreBasics />} />
          <Route path="/actions" element={<ActionsState />} />
          <Route path="/react" element={<ReactIntegration />} />

          {/* Power Tools */}
          <Route path="/validation" element={<ValidationSystem />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/rxjs" element={<RxJSIntegration />} />
          <Route path="/advanced" element={<AdvancedPatterns />} />

          {/* Reference */}
          <Route path="/api" element={<APIReference />} />
          <Route path="/examples" element={<Examples />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
