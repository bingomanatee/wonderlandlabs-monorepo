"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Branch_1 = require("../Branch");
class Beaver {
    constructor(tree) {
        this.tree = tree;
    }
    /**
     *
     * in interest of economy we seek out two branches:
     *  1 the first branch AFTER the first task in play (because we can't trim above that)
     * 2 the earliest branch up to or past the max count (becuase we always want to trim below that).
     *
     * We trim to the LOWEST of these two branches;
     */
    trim(maxCount, firstTimeToSave, ignoreTime = false) {
        let fromBottom = this.tree.root;
        let fromTop = this.tree.top;
        if (!ignoreTime && fromBottom.time >= firstTimeToSave)
            return;
        let count = 0;
        while (fromTop && count < maxCount) {
            fromTop = fromTop.prev;
            if (!ignoreTime &&
                fromBottom &&
                fromBottom.time &&
                fromBottom.time < firstTimeToSave) {
                fromBottom = fromBottom.next;
            }
            count += 1;
        }
        if (!fromTop || count < maxCount)
            return;
        // at this point if fromBottom exists it is at or a lttle past the earliest time.
        if (!ignoreTime) {
            while (fromBottom && fromBottom.time >= firstTimeToSave) {
                // ensure that we are preserving the branch BEFORE the eariest pending event
                fromBottom = fromBottom.prev;
            }
        }
        if (ignoreTime || fromTop.time < firstTimeToSave) {
            // we are trimming before or at the first event to save
            this.trimBefore(fromTop);
        }
        else {
            // there is an event prior to the size-based cutoff; trim to that event
            this.trimBefore(fromBottom);
        }
    }
    trimBefore(branch) {
        if (!branch || !branch.prev || branch.prev === this.tree.root)
            return;
        const oldRoot = this.tree.root;
        // create an artificial branch that has the value and time of the previous branch
        // but has an asserted not computed value.
        const seedBranch = branch.clone(true);
        Branch_1.Branch.unlink(seedBranch.prev, seedBranch);
        Branch_1.Branch.link(seedBranch, seedBranch.next);
        this.tree.root = seedBranch;
        // chain the new artificial branch to the trim target
        this.destoryOldData(oldRoot, seedBranch);
    }
    /**
     * this method erases all references contained in branches from the parameter forward.
     *
     * @param fromBranch
     */
    destoryOldData(fromBranch, toBranch) {
        let next;
        // because destruction removes prev/next link we
        // presere the "next to destroy" before calling `destroy()`.
        while (fromBranch) {
            if (fromBranch.time >= toBranch?.time)
                return;
            next = fromBranch.next;
            fromBranch.destroy();
            fromBranch = next;
        }
    }
    static limitSize(tree) {
        if (!(tree.top && tree.params?.serializer)) {
            return;
        }
        const { maxBranches, trimTo } = tree.params;
        if (trimTo >= maxBranches * 0.8) {
            throw new Error("your trim size must be 80% of your maxBranches or less");
        }
        if (trimTo < 4) {
            throw new Error("your maxBranches must be >= 4");
        }
        const activeTasks = tree.forest.activeTasks;
        let endTime = tree.top.time;
        let startTime = tree.root.time;
        const treeTime = endTime + startTime + 1;
        if (treeTime < maxBranches) {
            return; // its impossible for there to exist branch overflow if not enough time has passed
        }
        const count = tree.branchCount(maxBranches + 1);
        if (count <= maxBranches) {
            return;
        }
        if (activeTasks.length) {
            const firstTimeToSave = activeTasks.reduce((m, n) => {
                return Math.min(m, n);
            }, Number.POSITIVE_INFINITY);
            new Beaver(tree).trim(trimTo, firstTimeToSave);
        }
        else {
            new Beaver(tree).trim(trimTo, Number.POSITIVE_INFINITY, true);
        }
    }
}
exports.default = Beaver;
