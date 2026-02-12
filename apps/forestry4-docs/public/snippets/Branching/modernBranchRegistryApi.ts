import { Forest } from '@wonderlandlabs/forestry4';

type AppState = {
  user?: { id: string; name: string };
  settings: { theme: 'light' | 'dark' };
};

class UserBranch extends Forest<NonNullable<AppState['user']>> {
  get displayName() {
    return this.value.name.toUpperCase();
  }
}

class SettingsBranch extends Forest<AppState['settings']> {
  toggleTheme() {
    this.mutate((draft) => {
      draft.theme = draft.theme === 'light' ? 'dark' : 'light';
    });
  }
}

class AppForest extends Forest<AppState> {
  constructor(initialState: AppState) {
    super({
      value: initialState,
      branchParams: new Map([
        ['user', { subclass: UserBranch }],
        ['settings', { subclass: SettingsBranch }],
      ]),
    });
  }

  get userBranch() {
    // Lazy create from parent value using branchParams['user'].
    return this.$br.$get<AppState['user'], UserBranch>('user');
  }

  settingsBranch() {
    // Lazy create from existing parent data using branchParams['settings'].
    return this.$br.$get<AppState['settings'], SettingsBranch>('settings');
  }
}
