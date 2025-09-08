import type {Body, Constraint, Engine, Render, World} from 'matter-js'

// Matter.js type aliases
export type MatterEngine = Engine;
export type MatterWorld = World;
export type MatterRender = Render;
export type MatterBody = Body;
export type MatterConstraint = Constraint;

// Spring configuration
export interface SpringSettings {
    length: number;
    stiffness: number;
    damping: number;
}

// Serializable data structures (no Matter.js objects)
export interface SerializableNodeData {
    id: string;
    parentId?: string;
    nodeType: 'branch' | 'leaf' | 'terminal_leaf';
    constraintIds: string[];
}

export interface SerializableConstraintData {
    id: string;
    parentId: string;
    childId: string;
    length: number;
    stiffness: number;
    damping: number;
    isLeaf: boolean;
}

export interface SerializableTreeState {
    nodes: Record<string, SerializableNodeData>;
    constraints: Record<string, SerializableConstraintData>;
    rootId: string;
    physicsState?: {
        positions: Record<string, {x: number, y: number}>;
        velocities: Record<string, {x: number, y: number}>;
    };
}

// Legacy non-serializable structure (for backward compatibility)
export interface TreeNodeData {
    id: string;
    parentId?: string;
    body: MatterBody;
    constraintIds: string[];
    nodeType: 'branch' | 'leaf' | 'terminal_leaf';
}