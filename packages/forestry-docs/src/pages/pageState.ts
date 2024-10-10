import { Forest, MapCollection } from '@wonderlandlabs/forestry';
import { TreeIF } from '@wonderlandlabs/forestry/build/src/types';
import { upperFirst } from 'lodash-es';

export type PageDef = {
  name: string;
  title: string;
  blurb: string;
  icon?: string;
  url: string;
  art?: string;
  parent?: string;
  [key: string]: unknown;
};

const f = new Forest();

class PageCollection extends MapCollection<string, PageDef> {
  constructor() {
    super(
      'pageManager',
      {
        initial: new Map(),
      },
      {},
      f
    );
    this.currentUrl = f.addTree('currentUrl', { initial: '' });
  }

  currentUrl: TreeIF<string>;

  pageKey(page: PageDef): string {
    if (page.parent) {
      const parent = this.value.get(page.parent);
      if (!parent) throw new Error('cannot find parent ' + parent);
      return this.pageKey(parent) + '/' + page.name;
    }
    return page.name;
  }

  pages() {
    const pages = [...this.value.values()];
    return pages;
  }

  fileFor(page: PageDef) {
    let parentNode = page.parent ? this.pageWithName(page.parent) : undefined;
    const out = [upperFirst(page.name), upperFirst(page.name)];
    while (page.parent && parentNode) {
      out.unshift(parentNode.name, 'pages');
      parentNode = parentNode.parent ? this.pageWithName(parentNode.parent) : undefined;
    }
    return './pages/' + out.join('/');
  }

  pageUrl(page: PageDef): string {
    return this.pageHeritage(page)
      .map((p) => p.url)
      .join('/');
  }

  pageHeritage(page?: PageDef | string): PageDef[] {
    if (!page) return [];
    if (typeof page === 'string') return this.pageHeritage(this.pageWithName(page));
    if (!page) return [];
    if (page.parent) {
      return [...this.pageHeritage(page.parent), page];
    }
    return [page];
  }

  formatUrl(s: string, relative = false) {
    return (relative ? '' : '/') + s.replace(/^\//, '').replace(/\/$/, '');
  }

  addPage(p: PageDef) {
    const def: PageDef = { ...p };

    this.set(this.pageKey(def), def);
  }

  rootPages() {
    return this.pages().filter((p: PageDef) => !p.parent);
  }

  pageWithName(name: string) {
    return this.pages().find((p) => p.name === name);
  }
  pageWithUrl(url: string) {
    const out = this.pages().find((p: PageDef) => this.pageUrl(p) === url);
    if (!out) {
      console.log('cannot find page with url ' + url);
      console.log(this.pages().map((p) => [p, this.pageUrl(p)]));
    }
    return out;
  }

  pagesFor(url: string, relativeUrl: boolean = true) {
    const pages = [...this.value.values()];
    const active = pages.filter((p) => p.url.slice(0, url.length) === url);
    if (!relativeUrl) return active;
    return active.map((p) => {
      return { ...p, url: this.formatUrl(p.url!.slice(url.length), true) };
    });
  }
}

export const pageState = new PageCollection();

pageState.addPage({
  art: '/pictures/api.png',
  icon: '/pictures/icons/api.png',
  url: '/api',
  name: 'api',
  blurb: 'How to use Forestry',
  title: 'Forestry API',
});

pageState.addPage({
  url: 'forest',
  title: 'Forest',
  name: 'forest',
  parent: 'api',
  blurb: 'the "Data Context" of a set of related trees',
});

pageState.addPage({
  url: 'tree',
  title: 'Tree',
  name: 'tree',
  parent: 'api',
  blurb: 'a single state',
});

pageState.addPage({
  url: 'tree-params',
  title: 'TreeParams',
  name: 'tree-params',
  parent: 'api',
  showOnMenu: false,
  blurb: 'Configuration arguments to Tree',
});

pageState.addPage({
  url: 'collection',
  name: 'collection',
  blurb: 'The Collection class',
  title: 'Collection',
  parent: 'api',
});

pageState.addPage({
  url: 'map-collection',
  name: 'map-collection',
  blurb: 'A specialized Map Collection class',
  title: 'MapCollection',
  parent: 'api',
});
pageState.addPage({
  url: 'form-collection',
  name: 'form-collection',
  blurb: 'A specialized Form Manager class',
  title: 'FormCollection ',
  parent: 'api',
});

pageState.addPage({
  art: '/pictures/getting-started.png',
  url: 'getting-started',
  name: 'start',
  blurb: 'Up and running with Forestry',
  icon: '/pictures/icons/getting-started.png',
  title: 'Getting Started',
});
