import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import type { TreeStoreData } from '../managers/forestDataStore';
import type { TreeNodeData, SerializableNodeData } from '../types';
import { LeafParticleSystem, type LeafParticle } from './leafParticleSystem';

// Get seasonal background colors for PIXI
function getSeasonalBackgroundColor(season: string): number {
  switch (season) {
    case 'spring':
      return 0x87ceeb; // Sky blue
    case 'summer':
      return 0x87ceeb; // Sky blue
    case 'autumn':
    case 'fall':
      return 0xffa500; // Orange
    case 'winter':
      return 0x708090; // Slate gray
    default:
      return 0x87ceeb; // Default sky blue
  }
}

// Create PIXI application
export async function makePixi(container: HTMLElement): Promise<PIXI.Application> {
  const containerRect = container.getBoundingClientRect();
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;

  // Create Pixi app with container dimensions (v8 API)
  const pixiApp = new PIXI.Application();
  await pixiApp.init({
    width: containerWidth,
    height: containerHeight,
    backgroundColor: 0x87ceeb,
    antialias: true,
    autoDensity: true,
    resizeTo: container, // Auto-resize to container
    resolution: window.devicePixelRatio || 1, // Handle high DPI displays
  });
  return pixiApp;
}

// Create graphics containers for different layers
export async function createContainers(state: StoreIF<TreeStoreData>, pixiApp: PIXI.Application) {
  // 1. Background graphics (mountains and ground) - back layer
  const backgroundGraphics = new PIXI.Graphics();
  backgroundGraphics.position.set(0, 0);
  pixiApp.stage.addChild(backgroundGraphics);
  state.res.set('backgroundGraphics', backgroundGraphics);

  // 2. Tree graphics - middle layer
  const treeGraphics = new PIXI.Graphics();
  treeGraphics.position.set(0, 0);
  pixiApp.stage.addChild(treeGraphics);
  state.res.set('treeGraphics', treeGraphics);

  // 3. Leaf particle container - above tree graphics
  const leafContainer = new PIXI.Container();
  leafContainer.position.set(0, 0);
  pixiApp.stage.addChild(leafContainer);

  // 4. Coordinate validation graphics (debug layer) - top layer
  const coordGraphics = new PIXI.Graphics();
  coordGraphics.position.set(0, 0);
  pixiApp.stage.addChild(coordGraphics);
  state.res.set('coordGraphics', coordGraphics);

  // Initialize leaf particle system
  const leafParticleSystem = new LeafParticleSystem(leafContainer);
  await leafParticleSystem.loadTextures();
  state.res.set('leafParticleSystem', leafParticleSystem);

  return { coordGraphics, treeGraphics, backgroundGraphics, leafContainer, leafParticleSystem };
}

// Render background with mountains and ground
export function renderBackground(
  backgroundGraphics: PIXI.Graphics,
  pixiApp: PIXI.Application,
  season: string = 'summer'
) {
  if (!backgroundGraphics || !pixiApp) return;

  backgroundGraphics.clear();

  const width = pixiApp.screen.width;
  const height = pixiApp.screen.height;

  // Sky gradient (top half)
  const skyColor = getSeasonalBackgroundColor(season);
  backgroundGraphics.setFillStyle({ color: skyColor });
  backgroundGraphics.rect(0, 0, width, height / 2);
  backgroundGraphics.fill();

  // Ground (bottom half of screen)
  const groundColor = 0x228B22; // Forest green
  backgroundGraphics.setFillStyle({ color: groundColor });
  backgroundGraphics.rect(0, height / 2, width, height / 2);
  backgroundGraphics.fill();
}

// Render coordinate validation grid
export function renderCoordinateValidation(
  coordGraphics: PIXI.Graphics,
  pixiApp: PIXI.Application
) {
  if (!coordGraphics || !pixiApp) return;

  coordGraphics.clear();

  // Draw coordinate grid
  const gridSize = 50;
  const width = pixiApp.screen.width;
  const height = pixiApp.screen.height;

  coordGraphics.setStrokeStyle({ color: 0x333333, width: 1, alpha: 0.3 });

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    coordGraphics.moveTo(x, 0);
    coordGraphics.lineTo(x, height);
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    coordGraphics.moveTo(0, y);
    coordGraphics.lineTo(width, y);
  }

  coordGraphics.stroke();
}

// Draw tree nodes and connections using Matter.js physics positions
export function renderTree(
  treeGraphics: PIXI.Graphics,
  state: StoreIF<TreeStoreData>,
  season: string = 'summer',
  canvasWidth: number = 800,
  canvasHeight: number = 600
) {
  if (!treeGraphics) return;

  treeGraphics.clear();

  // Get all nodes and constraints from the store
  const allNodes = state.acts.getAllNodeRefs();
  const allConstraints = state.acts.getAllConstraintRefs();
  const serializedNodes = Array.from(state.value.nodes.values());

  // Find max depth for scaling
  let maxDepth = 0;
  serializedNodes.forEach((node) => {
    maxDepth = Math.max(maxDepth, (node as any).depth || 0);
  });

  // Draw constraints (branches and stems)
  allConstraints.forEach((constraint) => {
    if (!constraint.bodyA || !constraint.bodyB) return;

    const startPos = constraint.bodyA.position;
    const endPos = constraint.bodyB.position;

    // Check if this constraint connects to a leaf node (making it a stem)
    const nodeAData = allNodes.find((n) => n.body === constraint.bodyA);
    const nodeBData = allNodes.find((n) => n.body === constraint.bodyB);

    const isLeafStem = (nodeAData && (nodeAData.nodeType === 'leaf' || nodeAData.nodeType === 'terminal_leaf')) ||
                      (nodeBData && (nodeBData.nodeType === 'leaf' || nodeBData.nodeType === 'terminal_leaf'));

    if (isLeafStem) {
      // Draw stem (green, 2px wide)
      treeGraphics.setStrokeStyle({ color: 0x228B22, width: 2 });
      treeGraphics.moveTo(startPos.x, startPos.y);
      treeGraphics.lineTo(endPos.x, endPos.y);
      treeGraphics.stroke();
    } else {
      // Draw branch with depth-based thickness
      const width = constraint.render?.lineWidth || 2;
      const color = 0x8b4513; // Brown for branches

      treeGraphics.setStrokeStyle({ color, width });
      treeGraphics.moveTo(startPos.x, startPos.y);
      treeGraphics.lineTo(endPos.x, endPos.y);
      treeGraphics.stroke();

      // Draw depth number in the middle of the branch
      const midX = (startPos.x + endPos.x) / 2;
      const midY = (startPos.y + endPos.y) / 2;

      // Find the child node to get its depth
      const childNodeData = allNodes.find((n) => n.body === constraint.bodyB);
      if (childNodeData) {
        const serializedChild = serializedNodes.find(
          (n) => (n as any).id === (childNodeData as any).id
        );
        if (serializedChild) {
          // Create text for depth
          const text = new PIXI.Text({
            text: ((serializedChild as any).depth || 0).toString(),
            style: {
              fontSize: 12,
              fill: 0xffffff,
              fontWeight: 'bold',
              stroke: { color: 0x000000, width: 2 },
            },
          });
          text.anchor.set(0.5);
          text.position.set(midX, midY);
          treeGraphics.addChild(text);
        }
      }
    }
  });

  // Draw physics nodes (branch points)
  allNodes.forEach((nodeData) => {
    if (!nodeData.body) return;

    const pos = nodeData.body.position;
    const isLeaf = nodeData.nodeType === 'leaf' || nodeData.nodeType === 'terminal_leaf';

    if (!isLeaf) {
      // Draw branch nodes as brown circles
      treeGraphics.setFillStyle({ color: 0x8b4513 });
      treeGraphics.circle(pos.x, pos.y, 4);
      treeGraphics.fill();
    }
  });

  // Draw branch nodes first
  allNodes.forEach((nodeData) => {
    if (!nodeData.body) return;
    const pos = nodeData.body.position;

    if (nodeData.nodeType === 'branch') {
      treeGraphics.setFillStyle({ color: 0x8b4513 });
      treeGraphics.circle(pos.x, pos.y, 4);
      treeGraphics.fill();
    }
  });

  // Use particle system for leaf rendering
  const leafParticleSystem = state.res.get('leafParticleSystem') as LeafParticleSystem;
  if (leafParticleSystem) {
    let leafCount = 0;
    const types = new Map();

    // Count leaf nodes first
    serializedNodes.forEach((nodeData) => {
      const node = nodeData as any;
      if (types.has(node.nodeType)) {
        types.set(node.nodeType, types.get(node.nodeType) + 1);
      } else {
        types.set(node.nodeType, 1);
      }

      if (node.nodeType === 'leaf' || node.nodeType === 'terminal_leaf') {
        leafCount++;
      }
    });

    // Only recreate leaves if the count changed (tree structure changed)
    if (leafParticleSystem.needsUpdate(leafCount)) {
      console.log('Leaf count changed, recreating leaf particles');
      leafParticleSystem.clear();

      let leafDrawnCount = 0;
      serializedNodes.forEach((nodeData) => {
        const node = nodeData as any;

        if (node.nodeType === 'leaf' || node.nodeType === 'terminal_leaf') {
          // Try to get the physics body for this leaf
          const physicsNode = state.acts.getNodeRef(node.id);

          if (physicsNode && physicsNode.body) {
            const pos = physicsNode.body.position;

            // Find parent position for rotation
            let parentX = pos.x;
            let parentY = pos.y - 20; // Default parent position above

            if (node.parentId) {
              const parentPhysicsNode = state.acts.getNodeRef(node.parentId);
              if (parentPhysicsNode && parentPhysicsNode.body) {
                const parentPos = parentPhysicsNode.body.position;
                parentX = parentPos.x;
                parentY = parentPos.y;
              }
            }

            // Calculate rotation for leaf to point away from tree root
            // Find the root node position as the center point
            const rootNode = allNodes.find(n => n.nodeType === 'root');
            let treeCenterX = canvasWidth / 2; // Fallback to screen center
            let treeCenterY = canvasHeight / 2;

            if (rootNode && rootNode.body) {
              treeCenterX = rootNode.body.position.x;
              treeCenterY = rootNode.body.position.y;
            }

            const dx = pos.x - treeCenterX;
            const dy = pos.y - treeCenterY;
            const angleFromTreeCenter = Math.atan2(dy, dx);
            const randomVariation = (Math.random() - 0.5) * Math.PI / 6; // ±15 degrees
            const leafRotation = angleFromTreeCenter + randomVariation;

            // Create leaf particle
            const leafParticle: LeafParticle = {
              id: node.id,
              x: pos.x,
              y: pos.y,
              parentX: parentX,
              parentY: parentY,
              spriteIndex: Math.floor(Math.random() * 5), // Random leaf variation
              scale: 0.8 + Math.random() * 0.4, // Base scale variation
              rotation: leafRotation, // Pre-calculated rotation
              rotationVariation: randomVariation, // Store the random variation for consistent updates
              season: season as 'spring' | 'summer' | 'autumn' | 'winter',
              canvasWidth: canvasWidth, // Pass canvas width for scaling
              stemLength: 8 + Math.random() * 12 // Random stem length 8-20px
            };

            leafParticleSystem.addLeaf(leafParticle);
            leafDrawnCount++;
          }
        }
      });

      console.log(
        `Created ${leafDrawnCount} leaf particles`,
        'types are ',
        ...Array.from(types.entries()).map(([key, value]) => `${key}: ${value}`)
      );
    } else {
      // Just update positions of existing leaves (much more efficient)
      serializedNodes.forEach((nodeData) => {
        const node = nodeData as any;
        if (node.nodeType === 'leaf' || node.nodeType === 'terminal_leaf') {
          const sprite = leafParticleSystem.particles.get(node.id);

          if (sprite) {
            const physicsNode = state.acts.getNodeRef(node.id);
            if (physicsNode && physicsNode.body) {
              const pos = physicsNode.body.position;

              // Update leaf sprite position
              sprite.x = pos.x;
              sprite.y = pos.y;

              // Update leaf rotation to point away from tree root (more natural)
              // Find the root node position as the center point
              const rootNode = allNodes.find(n => n.nodeType === 'root');
              let treeCenterX = canvasWidth / 2; // Fallback to screen center
              let treeCenterY = canvasHeight / 2;

              if (rootNode && rootNode.body) {
                treeCenterX = rootNode.body.position.x;
                treeCenterY = rootNode.body.position.y;
              }

              const dx = pos.x - treeCenterX;
              const dy = pos.y - treeCenterY;
              const angleFromTreeCenter = Math.atan2(dy, dx);

              // Add the original random variation that was stored when leaf was created
              const leafData = leafParticleSystem.leafData.get(node.id);
              const originalVariation = leafData ? leafData.rotationVariation : 0;



              // Calculate rotation based on current position relative to tree center
              const newRotation = angleFromTreeCenter + originalVariation;
              sprite.rotation = newRotation;
            }
          }
        }
      });
    }
  }
}

// Utility method to create seasonal color palettes
export function createSeasonalPalette(season: string): number[] {
  const baseBrown = 0x8b4513; // Saddle brown

  switch (season) {
    case 'spring':
      return [
        baseBrown,
        parseInt(chroma(baseBrown).brighten(0.5).hex().replace('#', ''), 16),
        parseInt(chroma(baseBrown).set('hsl.h', 30).hex().replace('#', ''), 16), // More orange
      ];
    case 'summer':
      return [
        baseBrown,
        parseInt(chroma(baseBrown).darken(0.3).hex().replace('#', ''), 16),
        parseInt(chroma(baseBrown).set('hsl.h', 25).hex().replace('#', ''), 16), // Warmer brown
      ];
    case 'autumn':
    case 'fall':
      return [
        baseBrown,
        parseInt(chroma(baseBrown).set('hsl.h', 15).saturate(0.5).hex().replace('#', ''), 16), // Reddish brown
        parseInt(chroma(baseBrown).set('hsl.h', 35).brighten(0.2).hex().replace('#', ''), 16), // Golden brown
      ];
    case 'winter':
      return [
        baseBrown,
        parseInt(chroma(baseBrown).desaturate(0.3).darken(0.2).hex().replace('#', ''), 16), // Greyish brown
        parseInt(chroma(baseBrown).set('hsl.h', 220).desaturate(0.5).hex().replace('#', ''), 16), // Cool brown
      ];
    default:
      return [baseBrown];
  }
}
