import chroma from 'chroma-js';
import { Forest } from '@wonderlandlabs/forestry4';
import type { Branch, TreeConfig } from '../types';

// ForestBranch-specific actions for transient branch creation
export interface BranchCreationActions {
  initializeBranch(
    parentBranch: Branch,
    index: number,
    total: number,
    config: TreeConfig,
    generation: number
  ): Branch;
  addToParent(parentBranch: Branch): void;
  generateChildren(config: TreeConfig, generation: number): void;
  calculateBranchCount(parent: Branch, config: TreeConfig, generation: number): number;
  createBranchData(
    parent: Branch,
    index: number,
    numBranches: number,
    config: TreeConfig,
    generation: number
  ): Branch;
  generateBranchColor(parentColor: number): number;
}

export function createForestBranch(state: Forest<any, any>, branchPath: string) {
  return state.branch(branchPath, {
    value: null as Branch | null,
    actions: {
      // Branch-specific creation actions
      initializeBranch(
        branchValue,
        parentBranch: Branch,
        index: number,
        total: number,
        config: TreeConfig,
        generation: number
      ) {
        const branchState = this as unknown as Forest<Branch>;
        const newBranch = branchState.acts.createBranchData(
          parentBranch,
          index,
          total,
          config,
          generation
        );
        branchState.set('', newBranch);
        return newBranch;
      },

      addToParent(branchValue, parentBranch: Branch) {
        if (branchValue) {
          parentBranch.children.push(branchValue);
        }
      },

      generateChildren(branchValue, config: TreeConfig, generation: number) {
        if (branchValue && branchValue.absolutePosition) {
          state.acts.generateBranchesRecursively(branchValue, config, generation + 1);
        } else {
          console.warn('generateChildren called with invalid branchValue:', branchValue);
        }
      },

      // Helper method to calculate branch count
      calculateBranchCount(
        branchValue,
        parent: Branch,
        config: TreeConfig,
        generation: number
      ): number {
        // Use the tree generation algorithm from treeGenerator
        let baseBranches = generation === 0 ? 2 : 3;
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        return Math.max(1, baseBranches + variation);
      },

      // Helper method to create branch data
      createBranchData(
        branchValue,
        parent: Branch,
        index: number,
        numBranches: number,
        config: TreeConfig,
        generation: number
      ): Branch {
        // Validate parent has required properties
        if (!parent) {
          throw new Error(`Invalid parent branch: parent is null/undefined`);
        }
        if (!parent.absolutePosition) {
          console.error('Parent branch structure:', parent);
          throw new Error(
            `Invalid parent branch: missing absolutePosition. Parent ID: ${parent.id || 'unknown'}`
          );
        }

        // Calculate angle using the same logic as treeGenerator
        let finalAngle;
        if (generation === 0) {
          const maxSpread = Math.PI / 3; // 60 degrees
          const angleOffset =
            (index - (numBranches - 1) / 2) * (maxSpread / Math.max(1, numBranches - 1));
          finalAngle = -Math.PI / 2 + angleOffset + (Math.random() - 0.5) * 0.2;
        } else {
          const maxSpread = Math.PI / 3;
          const angleOffset =
            (index - (numBranches - 1) / 2) * (maxSpread / Math.max(1, numBranches - 1));
          finalAngle = parent.angle + angleOffset + (Math.random() - 0.5) * 0.3 - 0.1; // Upward bias
        }

        const branchLength =
          parent.length * config.lengthDecay * (0.75 + Math.random() * 0.3) * 1.11;
        const branchThickness = Math.max(2, parent.thickness * 0.7);

        const relativeX = Math.cos(finalAngle) * branchLength;
        const relativeY = Math.sin(finalAngle) * branchLength;

        return {
          id: `${parent.id}-${index}`,
          relativePosition: { x: relativeX, y: relativeY },
          absolutePosition: {
            x: parent.absolutePosition.x + relativeX,
            y: parent.absolutePosition.y + relativeY,
          },
          angle: finalAngle,
          thickness: branchThickness,
          length: branchLength,
          children: [],
          leaves: [],
          generation: generation + 1,
          level: parent.level,
          color: this.acts.generateBranchColor(parent.color),
          branchCountOffset: 0,
          ancestralOffsetSum: parent.ancestralOffsetSum,
          levelChangeOffset: 0,
          ancestralLevelSum: parent.ancestralLevelSum,
          velocity: { x: 0, y: 0 },
          force: { x: 0, y: 0 },
          springConstant: 0.02,
          mass: parent.mass / 2,
        };
      },

      // Helper method to generate branch color variation using chroma-js
      generateBranchColor(branchValue, parentColor: number): number {
        // Convert hex number to chroma color
        const baseColor = chroma(parentColor);

        // Add subtle random variations to hue, saturation, and lightness
        const hueVariation = (Math.random() - 0.5) * 10; // ±5 degrees
        const satVariation = (Math.random() - 0.5) * 0.1; // ±0.05 saturation
        const lightVariation = (Math.random() - 0.5) * 0.1; // ±0.05 lightness

        // Apply variations and ensure values stay in valid ranges
        const newColor = baseColor
          .set('hsl.h', `+${hueVariation}`)
          .set('hsl.s', Math.max(0, Math.min(1, baseColor.get('hsl.s') + satVariation)))
          .set('hsl.l', Math.max(0.1, Math.min(0.9, baseColor.get('hsl.l') + lightVariation)));

        // Convert back to hex number for PIXI
        return parseInt(newColor.hex().replace('#', ''), 16);
      },
    },
  });
}
