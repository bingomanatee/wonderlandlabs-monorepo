// Mock PIXI.js for testing
export class MockContainer {
  public name: string = '';
  public position = { x: 0, y: 0 };
  public rotation: number = 0;
  public children: MockContainer[] = [];
  public parent: MockContainer | null = null;

  constructor() {}

  addChild(child: MockContainer): MockContainer {
    this.children.push(child);
    child.parent = this;
    return child;
  }

  removeChild(child: MockContainer): MockContainer {
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
    return child;
  }

  getChildByName(name: string): MockContainer | null {
    for (const child of this.children) {
      if (child.name === name) {
        return child;
      }
      // Recursively search in children
      const found = child.getChildByName(name);
      if (found) return found;
    }
    return null;
  }

  set(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
  }
}

export class MockGraphics extends MockContainer {
  private strokeStyle: any = null;
  private fillStyle: any = null;
  private currentPath: Array<{type: string, args: any[]}> = [];

  setStrokeStyle(style: { width: number; color: number }): this {
    this.strokeStyle = style;
    return this;
  }

  setFillStyle(style: { color: number }): this {
    this.fillStyle = style;
    return this;
  }

  moveTo(x: number, y: number): this {
    this.currentPath.push({ type: 'moveTo', args: [x, y] });
    return this;
  }

  lineTo(x: number, y: number): this {
    this.currentPath.push({ type: 'lineTo', args: [x, y] });
    return this;
  }

  circle(x: number, y: number, radius: number): this {
    this.currentPath.push({ type: 'circle', args: [x, y, radius] });
    return this;
  }

  stroke(): this {
    this.currentPath.push({ type: 'stroke', args: [] });
    return this;
  }

  fill(): this {
    this.currentPath.push({ type: 'fill', args: [] });
    return this;
  }

  clear(): this {
    this.currentPath = [];
    this.strokeStyle = null;
    this.fillStyle = null;
    return this;
  }

  // For testing - get the drawing commands
  getDrawingCommands() {
    return this.currentPath;
  }
}

export class MockApplication {
  public stage: MockContainer;
  public screen = { width: 800, height: 600 };

  constructor() {
    this.stage = new MockContainer();
    this.stage.name = 'stage';
  }

  destroy(): void {
    // Mock cleanup
  }
}

// Mock the PIXI module
export const PIXI = {
  Container: MockContainer,
  Graphics: MockGraphics,
  Application: MockApplication,
};

// Global mock setup for tests
export function setupPixiMocks() {
  // Mock PIXI globally
  (global as any).PIXI = PIXI;
  
  // Mock canvas and WebGL context
  (global as any).HTMLCanvasElement = class MockCanvas {
    getContext() {
      return {
        canvas: this,
        drawImage: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        putImageData: () => {},
        createImageData: () => ({ data: new Uint8ClampedArray(4) }),
        setTransform: () => {},
        save: () => {},
        restore: () => {},
        scale: () => {},
        rotate: () => {},
        translate: () => {},
        transform: () => {},
        fillRect: () => {},
        clearRect: () => {},
        strokeRect: () => {},
        fillText: () => {},
        strokeText: () => {},
        measureText: () => ({ width: 0 }),
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
      };
    }
    
    toDataURL() {
      return 'data:image/png;base64,';
    }
  };

  // Mock WebGL context
  (global as any).WebGLRenderingContext = class MockWebGL {};
  (global as any).WebGL2RenderingContext = class MockWebGL2 {};
  
  // Mock ResizeObserver
  (global as any).ResizeObserver = class MockResizeObserver {
    constructor(callback: any) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
