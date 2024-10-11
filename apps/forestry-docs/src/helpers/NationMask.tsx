import { useEffect, useMemo, useState } from "react";
import { geoDataMap } from "./geoDataMap";
import * as PIXI from 'pixi.js';
import type { BasePlace } from "../types";
import { PixiComponent, Sprite } from "@pixi/react";
import { placeCollection } from "../CovidForestState";
import { debounceTime } from 'rxjs';
import { drawGeometry } from "./geo.htlpers";

const forestSize = { width: 3480, height: 2160 };
const forestRatio = forestSize.height / forestSize.width;

const MaskedSprite = PixiComponent('MaskedSprite', {
    create({ width, height, spriteSize }) {
        const mask = new PIXI.Graphics();
        for (const [name, geometry] of geoDataMap) {
            if (name !== 'ATA') drawGeometry(mask, geometry, width, height);
        }

        const sprite = PIXI.Sprite.from("img/forest-half-enhance.png");
        sprite.width = spriteSize.width;
        sprite.height = spriteSize.height;
        sprite.name = 'image sprite';
        sprite.mask = mask;

        console.log('masked sprite returning sprite')
        return sprite;
    },
    applyProps(sprite, _old, newProps) {
        const { width, height, spriteSize } = newProps;
        const mask = new PIXI.Graphics();
        for (const geometry of geoDataMap.values()) {
            drawGeometry(mask, geometry, width, height);
        }
        sprite.mask = mask;
        sprite.width = spriteSize.width;
        sprite.height = spriteSize.height;
    }
})

export const NationMask = ({ width, height }: {
    width: number, height: number
}) => {
    const [places, setPlaces] = useState<BasePlace[]>([]);

    useEffect(() => {
        const sub = placeCollection.tree.subject.pipe(debounceTime(100))
            .subscribe((placesMap) => {
                console.log('places size = ', placesMap.size);
                setPlaces(Array.from(placesMap.values()));
            })

        return () => sub?.unsubscribe();

    }, []);

    const spriteSize = useMemo(() => {
        const ratio = height / width;
        console.log('width', width, 'height', height, 'ratio', ratio, 'forestRatio', forestRatio);
        if (forestRatio > ratio) {
            return { width, height: forestRatio * width }
        }
        return { width: height / forestRatio, height }
    }, [width, height])

    return <>
        <Sprite width={spriteSize.width}
            blendMode={PIXI.BLEND_MODES.MULTIPLY}
            height={spriteSize.height}
            image="/img/forest-greyscale.png" />
        <MaskedSprite places={places} spriteSize={spriteSize}
            width={width} height={height} />
    </>




}