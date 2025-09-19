import { Forest } from '@wonderlandlabs/forestry4';

export interface NavigationState {
  openMenu: string | null;
  hoveredMenu: string | null;
}

class NavigationStore extends Forest<NavigationState> {
  constructor() {
    super({
      name: 'navigation',
      value: {
        openMenu: null,
        hoveredMenu: null,
      },
    });
  }

  openMenu(menuKey: string) {
    this.mutate((draft) => {
      draft.openMenu = menuKey;
      draft.hoveredMenu = menuKey;
    });
  }

  closeMenu() {
    this.mutate((draft) => {
      draft.openMenu = null;
      draft.hoveredMenu = null;
    });
  }

  setHoveredMenu(menuKey: string | null) {
    this.mutate((draft) => {
      draft.hoveredMenu = menuKey;
      // If we're hovering over a different menu while one is open, switch to it
      if (value.openMenu && menuKey && menuKey !== value.openMenu) {
        draft.openMenu = menuKey;
      }
    });
  }

  handleMenuEnter(menuKey: string) {
    this.mutate((draft) => {
      draft.hoveredMenu = menuKey;
      // Open menu on hover
      draft.openMenu = menuKey;
    });
  }

  handleMenuLeave() {
    this.mutate((draft) => {
      draft.hoveredMenu = null;
      // Close menu when leaving the entire menu area
      draft.openMenu = null;
    });
  }

  handleItemClick() {
    // Close menu when any item is clicked
    this.mutate((draft) => {
      draft.openMenu = null;
      draft.hoveredMenu = null;
    });
  }
}

export const navigationStoreFactory = () => new NavigationStore();

export default navigationStoreFactory;
