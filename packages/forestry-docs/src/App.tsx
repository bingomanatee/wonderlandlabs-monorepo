import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import style from './App.module.css'

import { useWindowSize } from './helpers/useWindowSize';
import { Highlight } from './helpers/Highlight';
import { appState, State } from './appState';

const forestSize = { width: 3480, height: 2160 };
const forestRatio = forestSize.height / forestSize.width;


function App() {

  const state = useRef<State>(appState());

  const [value, setValue] = useState(state.current.value);

  useEffect(() => {
    state.current?.subscribe((v) => setValue(v));
    () => state.current.destroy();
  }, []);
  const handleHover = useCallback((n: string) => {
    if (state.current) state.current.handleHover(n);
  }, [])

  const { width, height } = useWindowSize();
  const spriteSize = useMemo(() => {
    const ratio = height / width;
    console.log('width', width, 'height', height, 'ratio', ratio, 'forestRatio', forestRatio);
    if (forestRatio > ratio) {
      return { width, height: forestRatio * width }
    }
    return { width: height / forestRatio, height }
  }, [width, height])
  return (<div className={style.container}>
    <div className={style.backdrop} style={{
      width: `${spriteSize.width}px`,
      backgroundSize: `${spriteSize.width}px ${spriteSize.height}px`,
      height: `${spriteSize.height}px`,
      left: `${(width - spriteSize.width) / 2}px`,
      top: `${(Math.min(0, height - spriteSize.height) / 2)}px`
    }} />
    <div className={style.header}>
      <h1 className={style.title}>FORESTRY</h1>
    </div>
    <div className={style.content}>
      <p className={style.description}>
        A Journaled, Transactional state system<br />
        for JavaScript and React</p>

      {state.current ? (<section className={style.highlights}>
        <Highlight title="Journaled" name="journeld"
          state={state.current}>
          <p>Every change and action is logged and timestamped,
            even across multiple state collections, for easy diagnosis
          </p>
        </Highlight>
        <Highlight title="Transactional" name="trans"
          state={state.current}>
          Actions are either fully executed, or revert to the previous
          state
        </Highlight>
        <Highlight title="Observable" name="obs"
          state={state.current}>
          Built on RxJS, Forestry allows for observation of changes
          system wide as well as piping to all RxJS modifiers
        </Highlight>
        <Highlight title="Synchronous" name="sync"
          state={state.current}>
          Changes occur in real time
        </Highlight>
      </section>) : null}
      <pre style={{ color: 'white' }}>
        {JSON.stringify(value, true, 3)}
      </pre>
    </div>
  </div>
  )
}

export default App;

