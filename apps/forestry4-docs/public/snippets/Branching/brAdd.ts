// Assumes setup from branchMethodSetup.ts
// Uses branchParams default: branchParams['user'].subclass
const user = app.$br.$add<AppState['user'], UserBranch>('user', {});

// Uses explicit subclass for a path that has no branchParams default
const draftUser = app.$br.$add<AppState['draftUser'], DraftUserBranch>(
  'draftUser',
  { subclass: DraftUserBranch },
);
