import { BehaviorSubject, combineLatest, map } from 'rxjs'
import { LeafObj } from './types'
import { c } from '@wonderlandlabs/collect'
import { FormEnum } from '@wonderlandlabs/walrus/dist/enums'
import isEqual from 'lodash.isequal'

export function cascadeUpdatesToChildren(leaf: LeafObj<any>) {
  leaf.$subject.subscribe({
    next(value) {
      if (!leaf.$children?.size) {
        return;
      }

      const con = c(value);

      // on update, write to parent and update its value;

      if (!leaf.$blockUpdateToChildren && con.family === FormEnum.container) {
        leaf.$children.forEach((child: LeafObj<any>, key: any) => {
          const fragment = con.get(key)
          if (!isEqual(child.$value, fragment)) {

            // prevent a child/parent feedback loop
            const block = child.$blockUpdateToParent;
            child.$blockUpdateToParent = true;
            child.$value = fragment;
            child.$blockUpdateToParent = block;
          }
        });
      }
    },
    error(err) {

    }
  })
}

export function childrenToSubject(valueSubject: BehaviorSubject<any>, children: Map<any, LeafObj<any>> | undefined) {
  if (!children) {
    return valueSubject
  }
  const subjects = [valueSubject];
  const keys: any[] = [null];

  children.forEach((child, key) => {
    keys.push(key);
    subjects.push(child.$composedSubject);
  });

  return combineLatest(subjects)
    .pipe(
      map((childValues) => {
        const con = c(childValues[0]);
        if (con.family === FormEnum.container) {
          keys.forEach((key, index) => {
            if (index > 0) {
              const value = childValues[index];
              const key = keys[index];
              con.set(key, value);
            }
          })
        }
        return con.value;
      })
    )
}
