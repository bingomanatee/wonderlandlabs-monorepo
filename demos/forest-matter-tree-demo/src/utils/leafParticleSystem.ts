import * as PIXI from 'pixi.js';

export interface LeafParticle {
  id: string;
  x: number;
  y: number;
  parentX: number;
  parentY: number;
  spriteIndex: number; // 0-4 for green, 5-9 for brown
  scale: number;
  rotation: number;
  rotationVariation: number; // Store the random rotation variation for consistent updates
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  canvasWidth: number; // For scaling based on canvas size
  stemLength: number; // Store stem length to avoid flickering
}

export class LeafParticleSystem {
  private container: PIXI.Container;
  private texture: PIXI.Texture | null = null;
  private leafTextures: PIXI.Texture[] = [];
  public particles: Map<string, PIXI.Sprite> = new Map(); // Make public for optimization
  public leafData: Map<string, LeafParticle> = new Map(); // Make public for accessing leaf data

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  async loadTextures(): Promise<void> {
    try {
      // Use PIXI's asset loader system to load leaf.png
      await PIXI.Assets.load([
        { alias: 'leaf', src: '/img/leaf.png' }
      ]);

      // Get the loaded texture
      const leafTexture = PIXI.Assets.get('leaf');

      if (leafTexture) {
        // Use the single leaf texture for all variations
        for (let i = 0; i < 10; i++) {
          this.leafTextures.push(leafTexture);
        }
        console.log('Loaded leaf.png successfully, created', this.leafTextures.length, 'variations');
      } else {
        throw new Error('Leaf texture not found after loading');
      }
    } catch (error) {
      console.error('Failed to load leaf.png:', error);
      // Fallback: create simple colored sprites
      this.createFallbackTextures();
    }
  }

  private createFallbackTextures(): void {
    // Create simple colored textures as fallback
    for (let i = 0; i < 10; i++) {
      // Just use the white texture for now - we'll color the sprites
      this.leafTextures.push(PIXI.Texture.WHITE);
    }
    console.log('Using fallback textures (white squares with tinting)');
  }

  addLeaf(leafData: LeafParticle, leafColor?: number): void {
    if (this.leafTextures.length === 0) {
      console.warn('Leaf textures not loaded yet');
      return;
    }

    // Create leaf sprite (stems are now drawn as physics constraints)
    const texture = this.leafTextures[0]; // Just use the first texture
    const sprite = new PIXI.Sprite(texture);

    // Set sprite properties
    sprite.x = leafData.x;
    sprite.y = leafData.y;
    sprite.anchor.set(0.5); // Center the sprite

    // Calculate scale based on canvas width and add random length variation
    const baseScale = leafData.canvasWidth / 20000; // Double the size (was /40000, now /20000)
    const lengthVariation = 0.25 + Math.random() * 0.75; // Random length from 1/4 to full size
    const sizeVariation = 0.75 + Math.random() * 0.5; // 0.75 to 1.25 (±25% variation)
    const finalScale = baseScale * leafData.scale * sizeVariation * lengthVariation;

    // Scale appropriately - if using actual leaf texture, scale down; if white texture, scale up
    if (this.leafTextures[0] === PIXI.Texture.WHITE) {
      sprite.scale.set(finalScale * 200); // Make white squares visible as leaves
    } else {
      sprite.scale.set(finalScale); // Use calculated scale for actual leaf images
    }

    // Set color based on seasonal color or fallback to season-based logic
    if (leafColor !== undefined) {
      sprite.tint = leafColor;
    } else {
      // Fallback to hardcoded seasonal colors
      if (leafData.season === 'autumn' || leafData.season === 'winter') {
        sprite.tint = 0x8B4513; // Brown
      } else {
        sprite.tint = 0x32CD32; // Green
      }
    }

    // Use the pre-calculated rotation from leafData
    sprite.rotation = leafData.rotation;

    // Add leaf sprite to container
    this.container.addChild(sprite);
    this.particles.set(leafData.id, sprite);
    this.leafData.set(leafData.id, leafData);
  }

  updateLeaf(leafId: string, newData: Partial<LeafParticle>): void {
    const sprite = this.particles.get(leafId);
    const leafData = this.leafData.get(leafId);
    
    if (!sprite || !leafData) return;

    // Update leaf data
    Object.assign(leafData, newData);
    
    // Update sprite properties
    if (newData.x !== undefined) sprite.x = newData.x;
    if (newData.y !== undefined) sprite.y = newData.y;
    if (newData.scale !== undefined) sprite.scale.set(newData.scale);
    
    // Recalculate rotation if parent position changed
    if (newData.parentX !== undefined || newData.parentY !== undefined) {
      const dx = leafData.parentX - leafData.x;
      const dy = leafData.parentY - leafData.y;
      const angleToParent = Math.atan2(dy, dx);
      sprite.rotation = angleToParent + (Math.PI / 4);
    }
  }

  removeLeaf(leafId: string): void {
    const sprite = this.particles.get(leafId);
    if (sprite) {
      this.container.removeChild(sprite);
      sprite.destroy();
      this.particles.delete(leafId);
    }



    this.leafData.delete(leafId);
  }

  clear(): void {
    // Remove all leaf sprites
    this.particles.forEach((sprite) => {
      this.container.removeChild(sprite);
      sprite.destroy();
    });
    this.particles.clear();

    this.leafData.clear();
  }

  updateSeason(season: 'spring' | 'summer' | 'autumn' | 'winter'): void {
    // Update all leaves for the new season
    this.leafData.forEach((leafData, leafId) => {
      leafData.season = season;
      
      // Choose new texture based on season
      let textureIndex = leafData.spriteIndex;
      if (season === 'autumn' || season === 'winter') {
        textureIndex = Math.min(textureIndex + 5, 9); // Brown leaves
      } else {
        textureIndex = Math.min(textureIndex, 4); // Green leaves
      }
      
      const sprite = this.particles.get(leafId);
      if (sprite && this.leafTextures[textureIndex]) {
        sprite.texture = this.leafTextures[textureIndex];
      }
    });
  }

  getLeafCount(): number {
    return this.particles.size;
  }

  // Check if we need to update leaves (only recreate if leaf count changed)
  needsUpdate(expectedLeafCount: number): boolean {
    return this.particles.size !== expectedLeafCount;
  }

  // Update existing leaf positions without recreating sprites
  updateLeafPositions(leafNodes: any[]): void {
    leafNodes.forEach((nodeData) => {
      const node = nodeData as any;
      if (node.nodeType === 'leaf' || node.nodeType === 'terminal_leaf') {
        const sprite = this.particles.get(node.id);
        const leafData = this.leafData.get(node.id);

        if (sprite && leafData) {
          // Update position from physics
          const physicsNode = node.physicsRef;
          if (physicsNode && physicsNode.body) {
            const pos = physicsNode.body.position;
            sprite.x = pos.x;
            sprite.y = pos.y;

            // Update parent position for rotation if needed
            if (node.parentId) {
              const parentPhysicsNode = node.parentPhysicsRef;
              if (parentPhysicsNode && parentPhysicsNode.body) {
                const parentPos = parentPhysicsNode.body.position;
                const dx = parentPos.x - pos.x;
                const dy = parentPos.y - pos.y;
                sprite.rotation = Math.atan2(dy, dx);
              }
            }
          }
        }
      }
    });
  }

  // Update all leaf colors for season change
  updateAllLeafColors(leafColor: number): void {
    this.particles.forEach((sprite) => {
      sprite.tint = leafColor;
    });
  }
}
