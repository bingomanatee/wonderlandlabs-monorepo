import { Collection } from "@wonderlandlabs/forestry";


export type PageDef = { name: string; title: string; blurb: string; art: string };

type Sections = {
  sections: PageDef[]
}
class SectionsCollection extends Collection<Sections> {

  constructor() {
    super('sections', {
      initial: {sections: []},
      actions: {
        addSection(c, s: PageDef) {

        }
      }
    })
  }

}