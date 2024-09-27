import { useState, useEffect, useRef } from 'react';
import style from './Home.module.css';

import { Highlight } from '../../helpers/Highlight/Highlight';
import { appState, State } from '../../appState';

function Home() {
  const state = useRef<State>(appState());

  const [value, setValue] = useState(state.current.value);

  useEffect(() => {
    state.current?.subscribe((v) => setValue(v));
    () => state.current.destroy();
  }, []);

  return (
    <div className={style.container}>
      <div className={style.header}>
        <h1 className={style.title}>FORESTRY</h1>
      </div>
      <div className={style.content}>
        <p className={style.description}>
          A Journaled, Transactional state system
          <br />
          for JavaScript and React
        </p>

        {state.current ? (
          <section className={style.highlights}>
            <Highlight title="Journaled" name="journeld" url="journaled" state={state.current}>
              <p>
                Every change and action is logged and timestamped, even across multiple state
                collections, for easy diagnosis
              </p>
            </Highlight>
            <Highlight title="Transactional" name="trans" url="transactional" state={state.current}>
              Actions are either fully executed, or revert to the previous state
            </Highlight>
            <Highlight title="Observable" name="obs" state={state.current}>
              Built on RxJS, Forestry allows for observation of changes system wide as well as
              piping to all RxJS modifiers
            </Highlight>
            <Highlight title="Synchronous" name="sync" state={state.current}>
              Changes occur in real time
            </Highlight>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default App;
