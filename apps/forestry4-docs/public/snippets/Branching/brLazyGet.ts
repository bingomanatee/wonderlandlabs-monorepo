// Assumes setup from branchMethodSetup.ts
const maybeUser = app.$br.$get<AppState['user'], UserBranch>('user');
if (maybeUser) {
  maybeUser.set('name', 'Grace');
}
