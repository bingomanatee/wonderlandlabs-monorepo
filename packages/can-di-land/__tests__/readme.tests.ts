import { CanDI } from "../lib";

describe("CanDI", () => {
  describe("README", () => {
    it("should do example 1", async () => {
      const can = new CanDI();
      can.add("foo", 100, { type: "value" });
      // NOT awaited
      can.getAsync("sum-of-foo-and-vey").then((value) => {
        console.log("the sum is ", value); // triggers on the first setting of vey; then unsubscribes
      });
      can.add(
        "sum-of-foo-and-vey",
        (foo: number, vey: number) => {
          return foo + vey;
        },
        { type: "comp", deps: ["foo", "vey"] },
      );
      can.add("vey", -20, { type: "value" });
      can.set("vey", 300);
      setTimeout(() => {
        can.set("foo", 200);
      }, 50);
      await new Promise((done) => setTimeout(done, 100));
      can
        .getAsync("sum-of-foo-and-vey")
        .then((value) => console.log("after 100 ms, the sum is ", value));
    });
  });
});
