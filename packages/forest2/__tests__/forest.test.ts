import { Forest } from "../src/Forest";

describe("Forest", () => {
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
