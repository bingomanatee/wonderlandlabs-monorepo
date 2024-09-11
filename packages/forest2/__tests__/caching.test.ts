import { Forest } from "../src/Forest";
import type { BranchIF, MutatorFn } from "../src/types/types.branch";
import type { Mutator } from "../src/types/types.shared";
import type { TreeIF } from "../src/types/types.trees";

describe("caching", () => {
  describe("tree trimming", () => {
    it("should maintain a length of no longer than (maxLength + 1", () => {
      const f = new Forest();

      const MAX_BRANCHES = 10
      const doubler = f.addTree<number>("doubler", {
        maxBranches: MAX_BRANCHES,
        trimTo: 5,
        cloner: ( branch?: BranchIF<number>) => {
          if (branch) return branch.value;
          return 0;
        },
      });

      f.addTree("sat");

      const branchCount: number[] = [];
      const branchValues = new Map<number, number>();

      const doublerGrower: Mutator<number> = {
        mutator: (
          branch: BranchIF<number> | undefined
        ) => {
          if (branch) return branch.value * 2;
          return 1;
        },
        name: "doubler",
      };

      function checkBranchValues() {
        let branch = doubler.top;

        while(branch) {
            if (!branchValues.has(branch.time)) {
                branchValues.set(branch.time, branch.value);
            } else if (branchValues.get(branch.time) !== branch.value) {
                throw new Error('trimming should not change branch values')
            }
            branch = branch.prev
        }
      }

      for (let i = 0; i < 40; ++i) {
        doubler.grow(doublerGrower);
        branchCount.push(doubler.branchCount());
        expect(checkBranchValues).not.toThrow();
      }
      const max = Math.max(...branchCount);
      expect(max).toBeLessThanOrEqual(MAX_BRANCHES)
    });
  });
});
