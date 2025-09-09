import React from 'react';
import { Tree } from './components/Tree';
import  style from './App.module.css';

function App() {
  return (
    <div className={style.App}>
      <h1 className={style['floating-title']}>Forest Tree Demo - Move mouse over tree for wind effects!</h1>
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
