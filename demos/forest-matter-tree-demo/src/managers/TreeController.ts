import { CFG, RESOURCES } from './constants';
import { TreeState } from '../types';
import type { StoreIF } from '@wonderlandlabs/forestry4';
import { TreeStoreData } from './forestDataStore';
import { SerializableNodeData } from './types';
import { generateUUID } from '../GenerateUUID';
import { PhysicsUtils } from './PhysicsUtils';

type NabParams = {
  depth: Map<string, number>;
  idxByDepth: Map<Number, number>;
  canvasWidth: number;
  canvasHeight: number;
  counts: Map<number, number>;
  bodyIds: string[];
};

export class TreeController {
  public store: StoreIF<TreeStoreData>;
  public utils: PhysicsUtils;

  constructor(store: StoreIF<TreeState>) {
    this.store = store;
    this.utils = new PhysicsUtils(store);
  }

  generateTree(canvasWidth: number, canvasHeight: number): string {
    const { adjacency, rootId } = this.store.acts.generateRandomTree();
    this.buildPhysicsTree(adjacency, rootId, canvasWidth, canvasHeight);
    return rootId;
  }

  private makeDepth(rootId, adjacency) {
    const depth = new Map([[rootId, 0]]);
    const q = [rootId];
    while (q.length) {
      const p = q.shift();
      for (const c of adjacency.get(p!) || []) {
        if (!depth.has(c)) {
          depth.set(c, (depth.get(p!) ?? 0) + 1);
          q.push(c);
        }
      }
    }
    return depth;
  }

  private createNodeAndBody = (id: string, nabParams: NabParams): void => {
    const { depth, idxByDepth, canvasHeight, canvasWidth, counts, bodyIds } = nabParams;
    const d = depth.get(id) ?? 0;
    const k = idxByDepth.get(d) || 0;
    idxByDepth.set(d, k + 1);
    const slots = counts.get(d);

    const spreadWidth = canvasWidth * 0.6;
    const nodePosition = ((k + 1) / (slots + 1)) * spreadWidth;
    const x = canvasWidth * 0.5 - spreadWidth * 0.5 + nodePosition;
    const y = canvasHeight - 80 - d * 45;

    const nodeData: SerializableNodeData = {
      id,
      nodeType: 'branch',
      constraintIds: [],
    };
    this.store.acts.addNode(nodeData);

    const bodyProps = {
      frictionAir: CFG.airFriction,
      inertia: Infinity,
      inverseInertia: 0,
      render: {
        fillStyle: '#DC143C',
        strokeStyle: '#8B0000',
        lineWidth: 2,
      },
      collisionFilter: { group: -1 },
    };

    const body = this.utils.createBody(nodeData, x, y, CFG.nodeRadius, bodyProps);

    (body as any).repulsionFactor = 1.0;

    bodyIds.push(id);
  };

  private buildPhysicsTree(
    adjacency: Map<string, string[]>,
    rootId: string,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    this.utils.clear();

    const springs = this.utils.getSpringSettings(canvasHeight);

    const depth = this.makeDepth(rootId, adjacency);
    const maxDepth = Math.max(...depth.values());
    const counts = new Map();
    for (const [id, d] of depth) {
      counts.set(d, (counts.get(d) || 0) + 1);
    }
    const idxByDepth = new Map();

    const bodyIds: string[] = [];

    const allNodeIds = new Set([rootId]);
    adjacency.forEach((children, parent) => {
      allNodeIds.add(parent);
      children.forEach((child) => allNodeIds.add(child));
    });

    const nabProps: NabParams = {
      bodyIds,
      canvasWidth,
      canvasHeight,
      counts,
      idxByDepth,
      depth,
    };

    allNodeIds.forEach((id) => this.createNodeAndBody(id, nabProps));

    this.utils.addBodiesToWorld(bodyIds);

    const constraintIds: string[] = [];

    adjacency.forEach((children, parentId) => {
      const parentDepth = depth.get(parentId) ?? 0;

      children.forEach((childId) => {
        const childDepth = depth.get(childId) ?? 0;

        const depthFactor = childDepth / maxDepth;
        const length = springs.spring.length * (1 - depthFactor * 0.4);
        const stiffness = springs.spring.stiffness * (1 + depthFactor * 2);
        const damping = springs.spring.damping * (1 + depthFactor * 0.5);

        const constraintId = this.store.acts.connectNodes(
          parentId,
          childId,
          { length, stiffness, damping },
          false
        );

        const constraintData = this.store.acts.getConstraint(constraintId);
        if (constraintData) {
          const physicsConstraint = this.utils.createConstraint(constraintData);
          if (physicsConstraint) {
            constraintIds.push(constraintId);
          }
        }

        if (parentDepth > 0) {
          this.addLeafNodes(parentId, childId, canvasHeight);
        }
      });
    });

    allNodeIds.forEach((nodeId) => {
      const children = adjacency.get(nodeId) || [];
      const nodeDepth = depth.get(nodeId) ?? 0;

      if (children.length === 0 && nodeDepth > 0) {
        this.addTerminalLeaves(nodeId, canvasHeight);
      }
    });

    this.utils.addConstraintsToWorld(constraintIds);
  }

  private addLeafNodes(parentNodeId: string, childNodeId: string, canvasHeight: number): void {
    const numLeaves = 2 + Math.floor(Math.random() * 3);
    const springs = this.utils.getSpringSettings(canvasHeight);

    const parentBody = this.store.getRes([RESOURCES.BODIES, parentNodeId]);
    const childBody = this.store.getRes([RESOURCES.BODIES, childNodeId]);
    if (!parentBody || !childBody) {
      return;
    }

    for (let i = 0; i < numLeaves; i++) {
      const parentPos = parentBody.position;
      const childPos = childBody.position;
      const midX = (parentPos.x + childPos.x) * 0.5;
      const midY = (parentPos.y + childPos.y) * 0.5;

      const offsetX = (Math.random() - 0.5) * 60;
      const offsetY = (Math.random() - 0.5) * 40;

      const leafId = `leaf_${generateUUID()}`;

      // Create serializable leaf data
      const leafData: SerializableNodeData = {
        id: leafId,
        parentId: parentNodeId,
        nodeType: 'leaf',
        constraintIds: [],
      };
      this.store.acts.addNode(leafData);

      const leafBody = this.utils.createBody(
        leafData,
        midX + offsetX,
        midY + offsetY,
        CFG.leafRadius,
        {
          frictionAir: CFG.airFriction * 1.5,
          inertia: Infinity,
          inverseInertia: 0,
          render: {
            fillStyle: '#32CD32',
            strokeStyle: '#006400',
            lineWidth: 2,
          },
          collisionFilter: { group: -1 },
        }
      );

      (leafBody as any).repulsionFactor = Math.random() * 0.3;

      const constraintId = this.store.acts.connectNodes(
        parentNodeId,
        leafId,
        springs.leafSpring,
        true
      );

      const constraintData = this.store.acts.getConstraint(constraintId);
      if (constraintData) {
        const physicsConstraint = this.utils.createConstraint(constraintData);
        if (physicsConstraint) {
          this.utils.addConstraintsToWorld([constraintId]);
          this.utils.addBodiesToWorld([leafId]);
        }
      }
    }
  }

  private addTerminalLeaves(terminalNodeId: string, canvasHeight: number): void {
    const numLeaves = 3 + Math.floor(Math.random() * 4);
    const springs = this.utils.getSpringSettings(canvasHeight);

    const terminalBody = this.store.getRes([RESOURCES.BODIES, terminalNodeId]);
    if (!terminalBody) {
      return;
    }

    for (let i = 0; i < numLeaves; i++) {
      const nodePos = terminalBody.position;
      const angle = (i / numLeaves) * Math.PI * 2;
      const radius = 25 + Math.random() * 20;

      const leafX = nodePos.x + Math.cos(angle) * radius;
      const leafY = nodePos.y + Math.sin(angle) * radius;

      const leafId = `terminal_leaf_${generateUUID()}`;

      // Create serializable leaf data
      const leafData: SerializableNodeData = {
        id: leafId,
        parentId: terminalNodeId,
        nodeType: 'terminal_leaf',
        constraintIds: [],
      };
      this.store.acts.addNode(leafData);

      const terminalLeafBody = this.utils.createBody(leafData, leafX, leafY, CFG.leafRadius, {
        frictionAir: CFG.airFriction * 1.5,
        inertia: Infinity,
        inverseInertia: 0,
        render: {
          fillStyle: '#32CD32',
          strokeStyle: '#006400',
          lineWidth: 2,
        },
        collisionFilter: { group: -1 },
      });

      (terminalLeafBody as any).repulsionFactor = Math.random() * 0.4;

      const constraintId = this.store.acts.connectNodes(
        terminalNodeId,
        leafId,
        springs.leafSpring,
        true
      );

      const constraintData = this.store.acts.getConstraint(constraintId);
      if (constraintData) {
        const physicsConstraint = this.utils.createConstraint(constraintData);
        if (physicsConstraint) {
          this.utils.addConstraintsToWorld([constraintId]);
          this.utils.addBodiesToWorld([leafId]);
        }
      }
    }
  }

  updateSpringLengths(canvasHeight: number): void {
    const springs = this.utils.getSpringSettings(canvasHeight);

    this.store.acts.traverseNodes(this.store.value.rootId, (node) => {
      node.constraintIds.forEach((constraintId) => {
        const constraintData = this.store.acts.getConstraint(constraintId);
        if (constraintData) {
          const newLength = constraintData.isLeaf
            ? springs.leafSpring.length
            : springs.spring.length;

          this.store.acts.setConstraintLength(constraintId, newLength);
          this.utils.updateConstraint(constraintId, { length: newLength });
        }
      });
    });
  }

  scaleTree(oldWidth: number, oldHeight: number, newWidth: number, newHeight: number): void {
    const scaleX = newWidth / oldWidth;
    const scaleY = newHeight / oldHeight;
    const oldCenterX = oldWidth * 0.5;
    const oldCenterY = oldHeight * 0.5;
    const newCenterX = newWidth * 0.5;
    const newCenterY = newHeight * 0.5;

    this.utils.scaleAllPositions(scaleX, scaleY, oldCenterX, oldCenterY, newCenterX, newCenterY);

    this.updateSpringLengths(newHeight);
  }
}
