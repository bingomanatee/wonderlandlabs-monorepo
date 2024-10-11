import style from '../App.module.css'
import { deathCollections } from '../CovidForestState';
import type { BasePlace } from '../types';

export function PlaceTable({ places, dates }: { places: BasePlace[], dates: string[] }) {


  return (
    <table className={style.table}>
      <thead>
        <th className={style.stickyHead}>Date</th>
        {Array.from(places.values()).map((place: BasePlace) => (
          <th className={style.stickyHead} key={place.id}>{place.administrative_area_level_1}</th>
        ))}
      </thead>

      <tbody>
        {
          dates.map((date: string) => (

            <tr key={date}>
              <th>{date}</th>
              {Array.from(places.values()).map((place: BasePlace) => {
                const deaths = deathCollections.get(place.id);
                if (deaths?.has(date)) {
                  return <td>{deaths.get(date)}</td>
                }
                return <td>--</td>;
              })}
            </tr>

          )
          )
        }
      </tbody>

    </table>
  )

}