import { TreePhysics } from './TreePhysics';
import { treeController } from './TreeController';

// Exact copy from matter-tree-2
export function makeTree(canvas: HTMLCanvasElement) {
  console.log('🌳 Creating tree...');

  // Initialize physics simulation
  const scene = new TreePhysics(canvas);

  // Generate and build complete tree using TreeController
  const rootId = treeController.generateTree(canvas.width, canvas.height);

  // Create $root pin to anchor the tree
  scene.createRootPin(rootId);

  console.log(`✅ Tree created with root: ${rootId}`);
}

export function createTreeState() {
  return new Forest<TreeState, TreeActions>({
    value: {
      nodes: new Map(),
      constraints: new Map(),
      rootId: '',
      gravity: { x: 0, y: 0.8 },
      windForce: { x: 0, y: 0 },
      canvasWidth: 800,
      canvasHeight: 600,
    },

    actions: {
      // Initialize Matter.js physics engine
      initializePhysics(value: TreeState, container: HTMLDivElement) {
        const state = this as unknown as Forest<TreeState, TreeActions>;

        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // Create engine
        const engine = Engine.create();
        engine.world.gravity.y = value.gravity.y;
        engine.world.gravity.x = value.gravity.x;

        // Create renderer without specifying canvas - let Matter.js create its own
        const render = Render.create({
          engine: engine,
          options: {
            width: containerWidth,
            height: containerHeight,
            wireframes: true, // Enable wireframes to see if bodies are there
            background: '#000000', // Black background for contrast
            showAngleIndicator: true,
            showVelocity: true,
            showDebug: true,
            showBounds: true,
            showBroadphase: false,
            showIds: true,
          },
        });

        console.log('Render object created:', render);
        console.log('Render canvas:', render.canvas);
        console.log('Container before append:', container);

        // Append Matter.js canvas to container (like PIXI pattern)
        container.appendChild(render.canvas);

        console.log('Canvas appended to container');
        console.log('Container children after append:', container.children.length);
        console.log('Canvas dimensions:', render.canvas.width, 'x', render.canvas.height);
        console.log('Canvas style:', render.canvas.style.cssText);

        // Store Matter.js objects in resources
        state.$res.set('engine', engine);
        state.$res.set('render', render);
        state.$res.set('world', engine.world);
        state.$res.set('container', container);
        state.$res.set('config', defaultTreeConfig);

        // Update canvas dimensions in state
        state.mutate((draft) => {
          draft.canvasWidth = containerWidth;
          draft.canvasHeight = containerHeight;
        });

        // Add a large $test body to verify rendering works
        const testBody = Bodies.rectangle(containerWidth / 2, containerHeight / 2, 100, 100, {
          render: {
            fillStyle: '#ff0000',
            strokeStyle: '#ffffff',
            lineWidth: 3,
          },
          isStatic: true,
        });
        World.add(engine.world, testBody);
        console.log('Test body added at:', containerWidth / 2, containerHeight / 2);
        console.log('World bodies before render start:', engine.world.bodies.length);

        // Start the renderer
        Render.run(render);

        console.log('Render.run() called');
        console.log('Renderer running:', render.options);

        // Check if canvas is visible
        setTimeout(() => {
          console.log('Canvas visibility check:');
          console.log('Canvas in DOM:', document.contains(render.canvas));
          console.log('Canvas computed style:', getComputedStyle(render.canvas));
          console.log('World bodies after timeout:', engine.world.bodies.length);
        }, 100);
      },

      // Initialize the tree structure
      initializeTree(value: TreeState) {
        const state = this as unknown as Forest<TreeState, TreeActions>;
        const container = state.$res.get('container') as HTMLDivElement;

        if (!container) {
          console.error('Container not found in resources');
          return;
        }

        // Generate tree starting from bottom center
        const rootX = value.canvasWidth / 2;
        const rootY = value.canvasHeight - 50;

        console.log('Initializing tree at position:', rootX, rootY);
        state.acts.generateTree(rootX, rootY, 0);
        console.log(
          'Tree generation completed, nodes:',
          state.value.nodes.size,
          'constraints:',
          state.value.constraints.size
        );
      },

      // Generate tree recursively
      generateTree(value: TreeState, rootX: number, rootY: number, depth: number) {
        const state = this as unknown as Forest<TreeState, TreeActions>;
        const config = state.$res.get('config') as TreeConfig;

        if (depth >= config.maxDepth) {
          return;
        }

        // Create $root node if this is the first call
        if (depth === 0) {
          const rootId = state.acts.addNode('', '$branch', { x: rootX, y: rootY });
          state.mutate((draft) => {
            draft.rootId = rootId;
          });
        }

        // Get current nodes at this depth (use state.value to get the latest state)
        const currentNodes = Array.from(state.value.nodes.values()).filter((node) => {
          if (depth === 0) {
            // For depth 0, we want the $root node
            return node.id === 'root';
          } else {
            // For other depths, count the dashes to determine depth
            // depth 1: "$root-0", depth 2: "$root-0-1", etc.
            return node.id.split('-').length === depth + 1;
          }
        });

        // Generate children for each node at current depth
        currentNodes.forEach((node) => {
          state.acts.generateChildrenForNode(node, config, depth);
        });

        // Recursively generate next depth
        if (depth < config.maxDepth - 1) {
          state.acts.generateTree(rootX, rootY, depth + 1);
        }
      },

      // Generate children for a specific node
      generateChildrenForNode(value: TreeState, node: TreeNode, config: TreeConfig, depth: number) {
        const state = this as unknown as Forest<TreeState, TreeActions>;

        const numChildren = Math.floor(Math.random() * config.branchingFactor) + 1;

        for (let i = 0; i < numChildren; i++) {
          // Calculate child position
          const angle = (Math.PI / 3) * (i - numChildren / 2) + (Math.random() - 0.5) * 0.5;
          const length = config.branchLength * (1 - depth * 0.2);

          const childX = node.position.x + Math.cos(angle - Math.PI / 2) * length;
          const childY = node.position.y - Math.sin(angle - Math.PI / 2) * length;

          console.log(
            `Child ${i} for ${node.id}: angle=${angle.toFixed(2)}, length=${length.toFixed(1)}`
          );
          console.log(
            `Parent at (${node.position.x}, ${node.position.y}) -> Child at (${childX.toFixed(1)}, ${childY.toFixed(1)})`
          );

          // Determine node type
          const isLeaf = depth === config.maxDepth - 1 || Math.random() < config.leafProbability;
          const nodeType = isLeaf ? 'leaf' : '$branch';

          // Add child node
          const childId = state.acts.addNode(node.id, nodeType, { x: childX, y: childY });

          // Add constraint between $parent and child
          const springSettings: SpringSettings = {
            length: length,
            stiffness: config.springStiffness,
            damping: config.springDamping,
          };

          state.acts.addConstraint(node.id, childId, springSettings, isLeaf);
        }
      },

      // Add a new node to the tree
      addNode(
        value: TreeState,
        parentId: string,
        nodeType: TreeNode['nodeType'],
        position: {
          x: number;
          y: number;
        }
      ): string {
        const state = this as unknown as Forest<TreeState, TreeActions>;
        const config = state.$res.get('config') as TreeConfig;
        const engine = state.$res.get('engine') as MatterEngine;

        console.log(`=== addNode called ===`);
        console.log(`parentId: ${parentId}, nodeType: ${nodeType}, position:`, position);

        // Generate unique ID
        const nodeId = parentId ? `${parentId}-${state.value.nodes.size}` : 'root';
        console.log(`Generated nodeId: ${nodeId}`);

        // Determine visual properties
        const radius = nodeType === 'leaf' ? config.leafRadius : config.nodeRadius;
        const color = nodeType === 'leaf' ? 0x4caf50 : 0x8d6e63; // Green for leaves, brown for branches

        // Create Matter.js body with high visibility
        const body = Bodies.circle(position.x, position.y, radius, {
          render: {
            fillStyle: nodeType === 'leaf' ? '#00ff00' : '#ff6600', // Bright green for leaves, orange for branches
            strokeStyle: '#ffffff',
            lineWidth: 2,
          },
          isStatic: true, // Make bodies static so they don't fall due to gravity
        });

        console.log(
          `Created body for ${nodeId} at (${position.x}, ${position.y}) with radius ${radius}, color: ${`#${color.toString(16).padStart(6, '0')}`}`
        );

        // Add body to world
        World.add(engine.world, body);

        // Create DOM element for visualization
        const container = state.$res.get('container') as HTMLDivElement;
        console.log(`Container for DOM element:`, container);
        if (container) {
          console.log(
            `Creating DOM element for ${nodeId} at (${position.x}, ${position.y}) with radius ${radius}`
          );
          const domElement = document.createElement('div');
          domElement.style.position = 'absolute';
          domElement.style.left = `${position.x - radius}px`;
          domElement.style.top = `${position.y - radius}px`;
          domElement.style.width = `${radius * 2}px`;
          domElement.style.height = `${radius * 2}px`;
          domElement.style.borderRadius = '50%';
          domElement.style.backgroundColor = nodeType === 'leaf' ? '#00ff00' : '#ff6600';
          domElement.style.border = '2px solid #ffffff';
          domElement.style.zIndex = '1000';
          domElement.style.pointerEvents = 'none';
          domElement.title = `${nodeType}: ${nodeId}`;

          // Add text label
          domElement.innerHTML = `<span style="color: white; font-size: 10px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">${nodeId.split('-').pop()}</span>`;

          container.appendChild(domElement);
          console.log(
            `DOM element appended to container. Container children count:`,
            container.children.length
          );

          // Store DOM element reference
          state.$res.set(`dom-${nodeId}`, domElement);

          console.log(
            `✅ Successfully created DOM element for ${nodeId} at (${position.x}, ${position.y})`
          );
        } else {
          console.error(`❌ No container found for DOM element creation`);
        }

        console.log('World now has', engine.world.bodies.length, 'bodies');

        // Create tree node
        const node: TreeNode = {
          id: nodeId,
          parentId: parentId || undefined,
          nodeType,
          constraintIds: [],
          position,
          velocity: { x: 0, y: 0 },
          radius,
          color,
        };

        // Store body reference
        state.$res.set(`body-${nodeId}`, body);

        // Add node to state
        state.mutate((draft) => {
          draft.nodes.set(nodeId, node);
        });

        return nodeId;
      },

      // Add constraint between two nodes
      addConstraint(
        value: TreeState,
        parentId: string,
        childId: string,
        settings: SpringSettings,
        isLeaf = false
      ): string {
        const state = this as unknown as Forest<TreeState, TreeActions>;
        const engine = state.$res.get('engine') as MatterEngine;

        const constraintId = `${parentId}-${childId}`;

        // Get Matter.js bodies
        const parentBody = state.$res.get(`body-${parentId}`) as Body;
        const childBody = state.$res.get(`body-${childId}`) as Body;

        if (!parentBody || !childBody) {
          console.error('Bodies not found for constraint', parentId, childId);
          return constraintId;
        }

        // Create Matter.js constraint
        const constraint = Constraint.create({
          bodyA: parentBody,
          bodyB: childBody,
          length: settings.length,
          stiffness: settings.stiffness,
          damping: settings.damping,
          render: {
            strokeStyle: isLeaf ? '#4CAF50' : '#8D6E63',
            lineWidth: isLeaf ? 1 : 2,
          },
        });

        // Add constraint to world
        World.add(engine.world, constraint);

        // Create DOM line element for visualization
        const container = state.$res.get('container') as HTMLDivElement;
        if (container && parentBody && childBody) {
          const line = document.createElement('div');
          const dx = childBody.position.x - parentBody.position.x;
          const dy = childBody.position.y - parentBody.position.y;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

          line.style.position = 'absolute';
          line.style.left = `${parentBody.position.x}px`;
          line.style.top = `${parentBody.position.y}px`;
          line.style.width = `${length}px`;
          line.style.height = isLeaf ? '1px' : '2px';
          line.style.backgroundColor = isLeaf ? '#4CAF50' : '#8D6E63';
          line.style.transformOrigin = '0 50%';
          line.style.transform = `rotate(${angle}deg)`;
          line.style.zIndex = '999'; // Below nodes
          line.style.pointerEvents = 'none';

          container.appendChild(line);

          // Store DOM line reference
          state.$res.set(`dom-constraint-${constraintId}`, line);

          console.log(`Created DOM line for constraint ${constraintId}`);
        }

        // Create tree constraint
        const treeConstraint: TreeConstraint = {
          id: constraintId,
          parentId,
          childId,
          length: settings.length,
          stiffness: settings.stiffness,
          damping: settings.damping,
          isLeaf,
        };

        // Store constraint reference
        state.$res.set(`constraint-${constraintId}`, constraint);

        // Add constraint to state and update node references
        state.mutate((draft) => {
          draft.constraints.set(constraintId, treeConstraint);
          const parentNode = draft.nodes.get(parentId);
          if (parentNode) {
            parentNode.constraintIds.push(constraintId);
          }
          const childNode = draft.nodes.get(childId);
          if (childNode) {
            childNode.constraintIds.push(constraintId);
          }
        });

        return constraintId;
      },

      // Update physics simulation
      updatePhysics(value: TreeState) {
        const state = this as unknown as Forest<TreeState, TreeActions>;
        const engine = state.$res.get('engine') as MatterEngine;

        if (!engine) {
          return;
        }

        // Apply wind force to all bodies
        const windForce = state.value.windForce;
        if (windForce.x !== 0 || windForce.y !== 0) {
          state.value.nodes.forEach((node, nodeId) => {
            const body = state.$res.get(`body-${nodeId}`) as Body;
            if (body) {
              Body.applyForce(body, body.position, {
                x: windForce.x * 0.001,
                y: windForce.y * 0.001,
              });
            }
          });
        }

        // Update engine
        Engine.update(engine, 16.666); // ~60fps

        // Sync positions back to state
        state.mutate((draft) => {
          draft.nodes.forEach((node, nodeId) => {
            const body = state.$res.get(`body-${nodeId}`) as Body;
            if (body) {
              const updatedNode = draft.nodes.get(nodeId);
              if (updatedNode) {
                updatedNode.position = { x: body.position.x, y: body.position.y };
                updatedNode.velocity = { x: body.velocity.x, y: body.velocity.y };
              }
            }
          });
        });
      },

      // Apply wind force
      applyWind(value: TreeState, force: { x: number; y: number }) {
        const state = this as unknown as Forest<TreeState, TreeActions>;
        state.mutate((draft) => {
          draft.windForce = force;
        });
      },

      // Render the scene (Matter.js handles rendering automatically with Render.run)
      render(value: TreeState) {
        // Matter.js renderer runs automatically, no need to manually render each frame
        // This method is kept for compatibility but doesn't need to do anything
        const state = this as unknown as Forest<TreeState, TreeActions>;
        const engine = state.$res.get('engine') as MatterEngine;
        const render = state.$res.get('render') as MatterRender;

        if (engine && render) {
          console.log('Render method called, bodies in world:', engine.world.bodies.length);
          console.log('Render canvas exists:', !!render.canvas);
        }
      },

      // Cleanup resources
      cleanup(value: TreeState) {
        const state = this as unknown as Forest<TreeState, TreeActions>;
        const render = state.$res.get('render') as MatterRender;
        const engine = state.$res.get('engine') as MatterEngine;
        const container = state.$res.get('container') as HTMLDivElement;

        // Clean up DOM elements
        if (container) {
          // Remove all DOM node elements
          value.nodes.forEach((node, nodeId) => {
            const domElement = state.$res.get(`dom-${nodeId}`) as HTMLElement;
            if (domElement && domElement.parentNode) {
              domElement.parentNode.removeChild(domElement);
            }
          });

          // Remove all DOM constraint elements
          value.constraints.forEach((constraint, constraintId) => {
            const domLine = state.$res.get(`dom-constraint-${constraintId}`) as HTMLElement;
            if (domLine && domLine.parentNode) {
              domLine.parentNode.removeChild(domLine);
            }
          });
        }

        if (render) {
          Render.stop(render);
        }

        if (engine) {
          Engine.clear(engine);
        }

        // Clear all resources
        state.$res.clear();
      },
    },
  });
}
