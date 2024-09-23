import { useState, useEffect, useRef } from 'react'
import style from './App.module.css'
import { datesTree, loadPlaceData, placeCollection } from './CovidForestState';
import * as PIXI from 'pixi.js'
import {
  combineLatest,
  debounceTime
} from 'rxjs';
import { Stage, } from '@pixi/react';

import { useWindowSize } from './helpers/useWindowSize';
import { useWindowSizeWithRxJS } from './helpers/resizeDebounce';
import { NationMask } from './helpers/NationMask';
import type { BasePlace } from './types';
import { PlaceRollover } from './helpers/PlaceRollover';

function App() {

  const [places, setPlaces] = useState<BasePlace[]>([]);
  const { width, height } = useWindowSize();

  useEffect(() => {

    const sub3 =
      placeCollection.tree.subject.pipe(debounceTime(500))
        .subscribe((pm) => {
          console.log('setting places from ', Array.from(pm.values()));
          setPlaces(
            //@ts-expect-error
            Array.from(pm.values()));
        });

    loadPlaceData();
    return () => {
      sub3?.unsubscribe();
    }
  }, [])

  const resize = useWindowSizeWithRxJS();

  return (

    <div className={style.container}>
      {
        <Stage
          options={{
            backgroundColor: new PIXI.Color({ r: 0, g: 64, b: 180 }).toNumber(), resizeTo: window
          }}
          width={width} height={height}>
          <NationMask
            width={width} height={height} />
          {places.map((p) => (
            <PlaceRollover key={p.id} place={p} width={width} height={height} />
          ))}
        </Stage>
      }

    </div>

  )
}

export default App;

