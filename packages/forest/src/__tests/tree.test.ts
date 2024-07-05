import { Forest } from "../Forest";

type UserType = { name: string; age: number };
function bobAndSue() {
  return new Map([
    [100, { name: "Bob", age: 20 }],
    [200, { name: "Sue", age: 30 }],
  ]);
}

describe("tree", () => {
  describe(".leaf()", () => {
    it("should add the data values", () => {
      const f = new Forest();

      f.addTree({ name: "users", data: bobAndSue() });

      const tree = f.tree("users")!;

      expect(tree.leaf(100).hasValue).toBe(true);
      expect(tree.leaf(200).hasValue).toBe(true);
      expect(tree.leaf(300).hasValue).toBe(false);
    });
  });

  describe(".set()", () => {
    it("should allow you to add values", () => {
      const f = new Forest();

      f.addTree({ name: "users", data: bobAndSue() });

      const tree = f.tree("users")!;

      const bill = { name: "Bill", age: 50 };
      tree.set(400, bill);

      expect(tree.get(400)).toEqual(bill);

      const branches = tree.branches;
      expect(branches.length).toBe(2);
      expect(branches[0].data).toEqual(bobAndSue());
      expect(branches[1].data).toEqual(new Map([[400, bill]]));
      expect(tree.top).toEqual(branches[1]);

      expect(tree.get(400)).toEqual(bill);
    });
  });

  describe(".size", () => {
    const f = new Forest();

    const alpha = f.addTree({
      name: "alpha",
      data: new Map([
        [1, null],
        [2, null],
        [3, null],
      ]),
    });

    expect(alpha.size).toBe(3);

    alpha.set(1, "foo");

    expect(alpha.size).toBe(3);

    alpha.clearValues();

    expect(alpha.size).toBe(0);
  });
});
