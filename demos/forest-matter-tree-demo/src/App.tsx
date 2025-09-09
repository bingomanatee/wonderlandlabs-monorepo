import { Tree } from './Tree';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Forest Matter Tree Demo with PIXI.js</h1>
      <p>A physics-based tree simulation using Matter.js physics, PIXI.js rendering, and Forestry state management</p>
      <div className="canvas-area">
        <Tree />
      </div>
    </div>
  );
}

export default App;
