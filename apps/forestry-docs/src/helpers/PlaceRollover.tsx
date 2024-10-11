import { Graphics } from "@pixi/react";
import type { BasePlace } from "../types";
import { geoDataMap } from "./geoDataMap";
import { drawGeometry } from "./geo.htlpers";
import { useCallback, useState } from "react";
import * as PIXI from 'pixi.js';

const overColor = new PIXI.Color({ r: 200, g: 225, b: 51 }).toNumber();
const offColor = new PIXI.Color({ r: 0, g: 0, b: 0, a: 0.1 }).toNumber();

export function PlaceRollover({ place, width, height }: {
    place: BasePlace, width: number, height: number
}) {

    const [mouseIsOver, setMouseIsOver] = useState(false);

    const handleMouseOver = useCallback(() => {
        setMouseIsOver(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setMouseIsOver(false);
    }, [])

    const handleDraw = useCallback((g: PIXI.Graphics) => {
        console.log('handling draw')
        g.removeAllListeners();
        g.clear();
        if (!geoDataMap.has(place.iso_alpha_3)) {
            return;
        }
        g.interactive = true;
        g.on('mouseover', handleMouseOver);
        g.on('mouseleave', handleMouseLeave);
        const geometry = geoDataMap.get(place.iso_alpha_3);
        if (geometry)
            drawGeometry(g, geometry, width, height, mouseIsOver ? overColor : offColor);
        else {
            console.log('no geometry for ', place.id)
        }
    }, [place,
        mouseIsOver,
        handleMouseOver,
        handleMouseLeave,
        width,
        height]);

    if (mouseIsOver) console.log('over', place.id);
    return <Graphics draw={handleDraw} alpha={mouseIsOver ? 0.5 : 0}
        onmouseleave={() => setMouseIsOver(false)}
        onmouseenter={() => setMouseIsOver(true)} />


}