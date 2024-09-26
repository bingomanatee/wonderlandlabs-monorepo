import { useCallback, useEffect, useState, type PropsWithChildren, type ReactNode } from 'react'
import style from './Highlight.module.css'
import type { State, StateIF } from '../appState'

type Props = {
    title: ReactNode,
    state: State,
    name: string
}
export function Highlight({ title, name, children, state }:
    PropsWithChildren<Props>) {
    const [stateValue, setStateValue] = useState<StateIF>(state.value);
    useEffect(() => {
        state.register(name);

        const sub = state.subscribe({ next: (value: StateIF) => setStateValue(value) });

        return () => sub?.unsubscribe();
    }, [state]);

    const localHandleHover = useCallback(() => {
        state.handleHover(name);
    }, [state])

    const localBlur = useCallback(() => state.blur(), [state]);

    return (
        <section className={stateValue.target === name ?
            `${style.container} ${style['container-hovered']}` : style.container}
            onMouseLeave={localBlur}
            onMouseEnter={localHandleHover}>
            {title ? (<h2>{title}</h2>) : ''}
            <div className={style.content}>
                {typeof children === 'string' ? <p>{children}</p> : children}
            </div>
        </section>
    )
}