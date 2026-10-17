import { useEffect, useMemo, useRef, useState } from 'react'
import type { Forest } from '@wonderlandlabs/forestry4'

export default function useObserveForest<ValueType, OutputType = ValueType>(
  store: Forest<ValueType>,
  filter?: (value: ValueType) => OutputType,
): OutputType {
  const select = useMemo(
    () => filter ?? ((value: ValueType) => value as unknown as OutputType),
    [filter],
  )
  const [value, setValue] = useState<OutputType>(() => select(store.value))
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  useEffect(() => {
    const current = select(store.value)
    if (!selectionEqual(valueRef.current, current)) {
      valueRef.current = current
      setValue(current)
    }

    const sub = store.subscribe((nextValue) => {
      const selected = select(nextValue)

      if (selectionEqual(valueRef.current, selected)) {
        return
      }

      valueRef.current = selected
      setValue(selected)
    })

    return () => {
      sub?.unsubscribe()
    }
  }, [select, store])

  return value
}

function selectionEqual(left: unknown, right: unknown) {
  if (Object.is(left, right)) {
    return true
  }

  if (!isShallowRecord(left) || !isShallowRecord(right)) {
    return false
  }

  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) {
    return false
  }

  return leftKeys.every((key) => Object.is(left[key], right[key]))
}

function isShallowRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}
