import { BRANCH_CHILD_COUNTS } from './constants.ts';
import { shuffle } from 'lodash-es';

export default function createBranches(
  adjacency: Map<string, string[]>,
  parentId: string,
  depth: number,
  nodeCounter: { value: number }
): void {
  // Get possible child counts for this depth
  const childCountOptions = BRANCH_CHILD_COUNTS[depth] ?? [0];

  // Randomly select number of children from the available options
  const shuffledOptions = shuffle([...childCountOptions]);
  const numChildren = shuffledOptions.pop() ?? 0;

  if (numChildren === 0) return; // No children for this node

  const children: string[] = [];
  for (let i = 0; i < numChildren; i++) {
    const childId = `branch_${nodeCounter.value++}`;
    children.push(childId);
    createBranches(adjacency, childId, depth + 1, nodeCounter);
  }

  if (children.length > 0) {
    adjacency.set(parentId, children);
  }
}
