import { Forest, MapCollection } from "@wonderlandlabs/forestry";
import type { BasePlace, Place } from "./types";
const f = new Forest();

export const placeCollection = new MapCollection<string, BasePlace>(
  "places",
  { initial: new Map() },
  f
);
export const deathCollections: Map<
  string,
  MapCollection<string, number>
> = new Map();

export const datesTree = f.addTree<string[]>("dates", { initial: [] });

let loaded = false;
export async function loadPlaceData() {
  if (loaded) return;

  loaded = true;
  const response = await fetch("http://localhost:3000/data/1");
  if (!response.ok) {
    console.warn("cannot get data:", response);
  } else {
    const dateSet = new Set<string>();
    const places: Place[] = await response.json();
    for (const place of places) {
      const { deaths, dates, confirmed, ...basePlace } = place;
      const deathCollection = new MapCollection<string, number>(
        place.id + "-deaths",
        { initial: new Map() },
        f
      );

      dates.forEach((date, i) => {
        const deathsAtDate = deaths[i];
        deathCollection.set(date, deathsAtDate);
        dateSet.add(date);
      });

      placeCollection.set(place.id, basePlace as BasePlace);
      deathCollections.set(place.id, deathCollection);
    }

    // promote historical data upwards

    const dates = Array.from(dateSet.values()).sort();

    dates.forEach((date, i) => {
      deathCollections.forEach(
        (deathCollection: MapCollection<string, number>) => {
          if (!deathCollection.has(date)) {
            for (let index = i - 1; index >= 0; index -= 1) {
              let earlierDate = dates[index];

              if (deathCollection.has(earlierDate)) {
                deathCollection.set(date, deathCollection.get(earlierDate)!);
                break;
              }
            }
          } else if (i > 0) {
            if (deathCollection.get(date) === 0) {
              const prevDate = dates[i - 1];
              if (deathCollection.has(prevDate)) {
                const prevDeaths = deathCollection.get(prevDate)!;
                if (prevDeaths > 0) {
                  deathCollection.set(date, prevDeaths);
                }
              }
            }
          }
        }
      );
    });

    datesTree.next(Array.from(dateSet.values()).sort());
  }
}
