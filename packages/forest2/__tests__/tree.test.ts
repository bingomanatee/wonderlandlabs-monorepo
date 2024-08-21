import { Forest } from "../src/Forest";
import type { BranchIF } from "../src/types.branch";
import type { TreeIF } from "../src/types.trees";

describe("tree", () => {
  it("should update values", () => {
    const f = new Forest();

    const t = f.addTree<number>("bar", { initial: 100 });

    t.grow({
      next: 200,
    });

    expect(t.value).toBe(200);
  });
  it("should update values(function) ", () => {
    const f = new Forest();

    const t = f.addTree<number>("bar", { initial: 100 });

    t.grow({
      next(prev?: BranchIF<number>) {
        if (!prev) return 0;
        return prev.value * 2;
      },
    });

    expect(t.value).toBe(200);
  });

  it("should reflect validation", () => {
    const f = new Forest();

    const t = f.addTree<number>("bar", {
      initial: 100,
      validator(n: number) {
        if (n < 0) return new Error("must be positive");
        if (n !== n - (n % 1)) {
          throw new Error("must be a whole number");
        }
      },
    });

    t.grow({ next: 200 });
    expect(t.value).toBe(200);

    expect(() => t.grow({ next: -1 })).toThrow("must be positive");
    expect(() => t.grow({ next: 0.5 })).toThrow("must be a whole number");

    expect(t.value).toBe(200);
    t.next(300);
    expect(t.value).toBe(300);
  });
});
