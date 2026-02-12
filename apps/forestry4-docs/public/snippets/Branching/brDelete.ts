// Assumes setup from branchMethodSetup.ts
const user = app.$br.$add<AppState['user'], UserBranch>('user', {});
const removed = app.$br.delete(['user']); // true

// deleting a branch does not delete its parent data
const stillInRoot = app.get('user');
