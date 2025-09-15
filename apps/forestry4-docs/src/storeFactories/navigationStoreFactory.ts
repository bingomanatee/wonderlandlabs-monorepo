import { Forest } from '@wonderlandlabs/forestry4';

interface NavigationState {
  openMenu: string | null;
  hoveredMenu: string | null;
}

export const navigationStoreFactory = () => new Forest<NavigationState>({
  name: 'navigation',
  value: {
    openMenu: null,
    hoveredMenu: null,
  },
  actions: {
    openMenu(value, menuKey: string) {
      this.mutate(draft => {
        draft.openMenu = menuKey;
        draft.hoveredMenu = menuKey;
      });
    },

    closeMenu(value) {
      this.mutate(draft => {
        draft.openMenu = null;
        draft.hoveredMenu = null;
      });
    },

    setHoveredMenu(value, menuKey: string | null) {
      this.mutate(draft => {
        draft.hoveredMenu = menuKey;
        // If we're hovering over a different menu while one is open, switch to it
        if (value.openMenu && menuKey && menuKey !== value.openMenu) {
          draft.openMenu = menuKey;
        }
      });
    },

    handleMenuEnter(value, menuKey: string) {
      this.mutate(draft => {
        draft.hoveredMenu = menuKey;
        // Open menu on hover
        draft.openMenu = menuKey;
      });
    },

    handleMenuLeave(value) {
      this.mutate(draft => {
        draft.hoveredMenu = null;
        // Close menu when leaving the entire menu area
        draft.openMenu = null;
      });
    },

    handleItemClick(value) {
      // Close menu when any item is clicked
      this.mutate(draft => {
        draft.openMenu = null;
        draft.hoveredMenu = null;
      });
    }
  }
});

export default navigationStoreFactory;
