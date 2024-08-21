import { Forest } from "../src/Forest";

describe("Forest", () => {
  describe("constructor", () => {
    it("should start without any branches", () => {
      const f = new Forest();

      expect(f.hasTree("foo")).toBeFalsy();
    });

    it("should allow trees to be added", () => {
      const f = new Forest();

      f.addTree("foo", { initial: 1 });
      expect(f.hasTree("foo")).toBeTruthy();

      expect(f.tree("foo")?.value).toBe(1);

      f.addTree("bar", { initial: 100 });
      expect(f.tree("bar")?.value).toBe(100);
    });
  });

  describe("do", () => {
    it("should return the result of the function", () => {
      const f = new Forest();
      f.addTree("foo", { initial: 100 });
      f.addTree("bar", { initial: 300 });

      const sum = f.do<number>((f) => {
        return (
          (f.tree<number>("foo")?.value ?? 0) +
          (f.tree<number>("bar")?.value ?? 0)
        );
      });

      expect(sum).toEqual(400);
    });

    it("should regress two branches if both are changed in a do", () => {
      const f = new Forest();
      const foo = f.addTree("foo", {
        initial: 100,
        validator(n) {
          if (n % 100) throw new Error("foo must be multiple of 100");
        },
      });
      const bar = f.addTree("bar", { initial: 300 });

      expect(() => {
        f.do(() => {
          f.tree<number>("bar")?.next(500);
          f.tree<number>("foo")?.next(333);
        });
      }).toThrow("foo must be multiple of 100");
      expect(foo.value).toBe(100);
      expect(bar.value).toBe(300);
    });
  });
});
