export class XYContainer {
  left: number | null = null;
  right: number | null = null;
  top: number | null = null;
  bottom: number | null = null;

  add(i: number, j: number) {
    if (this.left === null || i < this.left) {
      this.left = i;
    }

    if (this.right === null || i > this.right) {
      this.right = i;
    }

    if (this.top === null || j > this.top) {
      this.top = j;
    }

    if (this.bottom === null || j < this.bottom) {
      this.bottom = j;
    }
  }
}
