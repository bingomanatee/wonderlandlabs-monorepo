import { Physics } from './PhysicsManager';
import {
  CreateTerminalLeafBodyParams,
  forestryTreeData,
  ProcessChildParams,
} from './ForestryTreeData';

// Coordinates between serializable data and physics runtime
export class TreeController {
  // Generate and build a complete tree
  generateTree(canvasWidth: number, canvasHeight: number): string {
    console.log('🌳 Generating new tree...');

    // 1. Generate tree structure (serializable)
    const { adjacency, rootId } = forestryTreeData.acts.generateRandomTree();

    // 2. Build physics representation
    forestryTreeData.acts.buildPhysicsTree(adjacency, rootId, canvasWidth, canvasHeight);

    console.log(`✅ Tree generated with ${forestryTreeData.acts.getNodeCount()} nodes`);
    return rootId;
  }
}

// Global instance
export const treeController = new TreeController();
