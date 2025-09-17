import { Forest } from '@wonderlandlabs/forestry4';

// Simple $test to see if Forest works at all
export function createSimpleForest() {
  console.log('Creating simple Forest...');

  try {
    const forest = new Forest({
      value: {
        nodes: {},
        constraints: {},
        rootId: '',
      },
      actions: {
        test(value: any) {
          console.log('Test action called');
          return '$test works';
        },

        generateRandomTree(value: any) {
          console.log('generateRandomTree called');
          return {
            adjacency: new Map(),
            rootId: 'root',
          };
        },
      },
    });

    console.log('Simple Forest created successfully:', forest);
    console.log('Forest acts:', forest.acts);
    console.log('Available actions:', Object.keys(forest.acts));

    return forest;
  } catch (error) {
    console.error('Failed to create Forest:', error);
    throw error;
  }
}

// Test instance
export const simpleForest = createSimpleForest();
