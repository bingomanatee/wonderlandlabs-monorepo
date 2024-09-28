import { Collection } from '@wonderlandlabs/forestry';

type PageList = string[];
export type NavValue = {
  pageSet: PageList;
  parent: string;
};
const INITIAL = {
  pageSet: [],
  parent: '',
};

type NavigatorFn = (target: string) => void;

class Navigator extends Collection<NavValue> {
  constructor() {
    super('navigation', {
      initial: INITIAL,
      actions: {
        next(coll, go: NavigatorFn) {
          if (!coll.value.pageSet.length) return;
          const current = window.location.pathname;
          if (current === coll.value.pageSet[coll.value.pageSet.length - 1]) {
            if (coll.value.parent) go(coll.value.parent);
            return;
          }
          const currentIdx = coll.value.pageSet.indexOf(current);
          let target = coll.value.pageSet[(currentIdx + 1) % coll.value.pageSet.length];
          if (currentIdx === -1) {
            target = coll.value.pageSet[0];
          }
          go(target);
          window.scrollTo(0, 0);
          const rootContent = window.document.getElementById('rootContent');
          rootContent?.scrollTo(0, 0);
        },

        back(coll, go: NavigatorFn) {
          if (!coll.value.pageSet.length) return;
          const current = Math.max(0, coll.value.pageSet.indexOf(window.location.pathname));
          if (current === 0) {
            if (coll.value.parent) {
              go(coll.value.parent);
            }
            return;
          }
          let target = coll.value.pageSet[current - 1];
          go(target);
          window.scrollTo(0, 0);
          const rootContent = window.document.getElementById('rootContent');
          rootContent?.scrollTo(0, 0);
        },
      },
    });
  }

  nextPage(navigator: NavigatorFn): void {
    this.act('next', navigator);
  }

  backPage(navigator: NavigatorFn): void {
    this.act('back', navigator);
  }

  setPages(pageSet: PageList) {
    this.mutate(({ value }) => ({ ...value, pageSet }), 'add pages');
  }

  setParent(parent = '') {
    this.mutate(({ value }) => ({ ...value, parent }), 'set parent', parent);
  }
}

export const navigator = new Navigator();
