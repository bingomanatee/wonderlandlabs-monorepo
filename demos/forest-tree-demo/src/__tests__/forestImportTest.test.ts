import { describe, it, expect } from 'vitest';

describe('Forest Import Test', () => {
  it('should be able to import Forest', async () => {
    try {
      const { Forest } = await import('@wonderlandlabs/forestry4');
      expect(Forest).toBeDefined();
      console.log('Forest imported successfully');
    } catch (error) {
      console.error('Forest import failed:', error);
      throw error;
    }
  });

  it('should be able to create a simple Forest instance', async () => {
    try {
      const { Forest } = await import('@wonderlandlabs/forestry4');
      
      const simpleForest = new Forest({
        value: { test: 'value' },
        actions: {
          updateTest(value: any, newValue: string) {
            const state = this as any;
            state.set('test', newValue);
          }
        }
      });

      expect(simpleForest).toBeDefined();
      expect(simpleForest.value.test).toBe('value');
      
      simpleForest.acts.updateTest('new value');
      expect(simpleForest.value.test).toBe('new value');
      
      console.log('Simple Forest instance created and tested successfully');
    } catch (error) {
      console.error('Forest instance creation failed:', error);
      throw error;
    }
  });
});
