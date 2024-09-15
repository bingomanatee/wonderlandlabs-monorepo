import { Branch } from "../Branch";
import type { BranchIF } from "../types/types.branch";
import type { TreeIF } from "../types/types.trees";
import { BENCHMARK_CAUSE } from "./BenchMarker";

type ActiveTaskInfo = {
  hasActiveTasks: boolean;
  earliestActiveTask: number;
};
export default class Beaver<ValueType> {
  constructor(private tree: TreeIF<ValueType>) {}

  /**
   *
   * in interest of economy we seek out two branches:
   *  1 the first branch AFTER the first task in play (because we can't trim above that)
   * 2 the earliest branch up to or past the max count (becuase we always want to trim below that).
   *
   * We trim to the LOWEST of these two branches;
   */
  public trim() {
    let tooLongBranch: BranchIF<ValueType>;

    const { earliestActiveTask, hasActiveTasks } = this.activeTasks();
    const { maxBranches, trimTo } = this.tree.params;

    let count = 0;
    this.tree.forEachDown((branch, c) => {
      if (tooLongBranch) return;
      if (c >= maxBranches - 1) {
        if (hasActiveTasks) {
          if (branch.time < earliestActiveTask) {
            tooLongBranch = branch;
            count = c;
            return true;
          }
        } else {
          tooLongBranch = branch;
          count = c;
          return true;
        }
      }
    }, maxBranches + 1);

    if (!tooLongBranch || tooLongBranch === this.tree.root) {
      return;
    }

    let branch = tooLongBranch;
    // go forward in time until you are at the trimTo point OR the next branch is the earliest active task.
    while (branch && count >= trimTo) {
      if (hasActiveTasks && branch.next?.time >= earliestActiveTask) {
        // we cannot trim branches in an active task.

        break;
      }
      branch = branch.next;
      count -= 1;
    }

    if (!branch) {
      return;
    }
    const oldRoot = this.tree.root;

    // create an artificial branch that has the value and time of the previous branch
    // but has an asserted not computed value.
    const seedBranch = branch.clone(true);
    Branch.unlink(seedBranch.prev, seedBranch);
    Branch.link(seedBranch, seedBranch.next);
    this.tree.root = seedBranch;
    // chain the new artificial branch to the trim target
    this.destoryOldData(oldRoot, seedBranch);
  }

  /**
   * this method erases all references contained in branches from the parameter forward.
   *
   * @param fromBranch
   */
  private destoryOldData(
    fromBranch: BranchIF<ValueType> | undefined,
    toBranch: BranchIF<ValueType> | undefined
  ) {
    let next: BranchIF<ValueType> | undefined;
    // because destruction removes prev/next link we
    // presere the "next to destroy" before calling `destroy()`.
    while (fromBranch) {
      if (fromBranch.time >= toBranch?.time) {
        return;
      }
      next = fromBranch.next;
      fromBranch.destroy();
      fromBranch = next;
    }
  }

  activeTasks(): ActiveTaskInfo {
    const activeTasks = this.tree.forest.activeTasks;
    if (activeTasks.length) {
      const earliestActiveTask = activeTasks.reduce((m, n) => {
        return Math.min(m, n);
      }, Number.POSITIVE_INFINITY);

      return { hasActiveTasks: true, earliestActiveTask };
    } else {
      return {
        hasActiveTasks: false,
        earliestActiveTask: Number.POSITIVE_INFINITY,
      };
    }
  }

  limitBranchLength() {
    if (!(this.tree.top && this.tree.params?.serializer)) {
      return;
    }

    const { maxBranches } = this.tree.params;

    // perform some cursory computations to ensure the branch is potentially long enough to trim;
    const endTime = this.tree.top.time;
    const startTime = this.tree.root.time;
    const branchDuration = endTime + startTime + 1;

    if (branchDuration < maxBranches) {
      return; // its impossible for there to exist branch overflow if not enough time has passed
    }

    this.trim();
  }
}
