import React from 'react';
import { Tree } from './components/Tree';
import './Tree.css';

function App() {
  return (
    <div className="App">
      <Tree />
      <a
        href="https://github.com/bingomanatee/wonderlandlabs-monorepo/tree/main/packages/forestry4"
        target="_blank"
        rel="noopener noreferrer"
        className="forestry-badge"
      >
        Powered by Forestry4 🌲
      </a>
    </div>
  );
}

export default App;
