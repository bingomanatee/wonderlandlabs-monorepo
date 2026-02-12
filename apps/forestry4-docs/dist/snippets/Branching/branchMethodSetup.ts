// Assume Forest is imported from '@wonderlandlabs/forestry4'
type AppState = {
  user: { name: string };
  settings: { theme: 'light' | 'dark' };
  draftUser: { name: string };
};

class UserBranch extends Forest<AppState['user']> {}
class DraftUserBranch extends Forest<AppState['draftUser']> {}

const app = new Forest<AppState>({
  value: {
    user: { name: 'Ada' },
    settings: { theme: 'light' },
    draftUser: { name: 'New User' },
  },
  branchParams: new Map([['user', { subclass: UserBranch }]]),
});
