// Assumes setup from branchMethodSetup.ts
// backward-compatible, but deprecated
const user = app.$branch<AppState['user'], UserBranch>('user', {});
