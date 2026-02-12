// Assumes setup from branchMethodSetup.ts
const beforeCreate = app.$br.get('user'); // undefined

app.$br.$add<AppState['user'], UserBranch>('user', {});
const afterCreate = app.$br.get('user'); // branch instance
