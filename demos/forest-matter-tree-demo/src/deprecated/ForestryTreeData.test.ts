import { createForestryTreeData, forestryTreeData } from './ForestryTreeData';

describe('ForestryTreeData', () => {
  test('should create Forestry store successfully', () => {
    console.log('Testing Forestry store creation...');

    // Test factory function
    const store = createForestryTreeData();
    console.log('Store created:', store);
    console.log('Store acts:', store.acts);
    console.log('Store value:', store.value);

    expect(store).toBeDefined();
    expect(store.acts).toBeDefined();
    expect(store.value).toBeDefined();
  });

  test('should have initial state', () => {
    const store = createForestryTreeData();

    expect(store.value.nodes).toEqual({});
    expect(store.value.constraints).toEqual({});
    expect(store.value.rootId).toBe('');
  });

  test('should have all required actions', () => {
    const store = createForestryTreeData();

    // Check that all actions exist
    expect(typeof store.acts.getState).toBe('function');
    expect(typeof store.acts.loadState).toBe('function');
    expect(typeof store.acts.getNode).toBe('function');
    expect(typeof store.acts.addNode).toBe('function');
    expect(typeof store.acts.generateRandomTree).toBe('function');

    console.log('All actions available:', Object.keys(store.acts));
  });

  test('should test generateRandomTree action', () => {
    const store = createForestryTreeData();

    console.log('Testing generateRandomTree...');

    try {
      const result = store.acts.generateRandomTree();
      console.log('generateRandomTree result:', result);

      expect(result).toBeDefined();
      expect(result.adjacency).toBeDefined();
      expect(result.rootId).toBeDefined();
    } catch (error) {
      console.error('generateRandomTree failed:', error);
      throw error;
    }
  });

  test('should test global instance', () => {
    console.log('Testing global forestryTreeData instance...');
    console.log('forestryTreeData:', forestryTreeData);
    console.log('forestryTreeData.acts:', forestryTreeData.acts);

    expect(forestryTreeData).toBeDefined();
    expect(forestryTreeData.acts).toBeDefined();
    expect(typeof forestryTreeData.acts.generateRandomTree).toBe('function');
  });
});
