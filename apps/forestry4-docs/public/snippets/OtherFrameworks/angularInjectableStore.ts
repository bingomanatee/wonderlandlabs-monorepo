// Injectable Forestry Store for Angular
import { Injectable, OnDestroy } from '@angular/core';
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged, map } from 'rxjs/operators';

// User state interface
interface UserState {
  id: number | null;
  username: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  isAuthenticated: boolean;
  loading: boolean;
}

// Validation schema
const UserStateSchema = z.object({
  id: z.number().nullable(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  profile: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    avatar: z.string().url().optional().or(z.literal('')),
  }),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
    language: z.string().min(2, 'Language code required'),
  }),
  isAuthenticated: z.boolean(),
  loading: z.boolean(),
});

@Injectable({
  providedIn: 'root'
})
export class UserStoreService extends Forest<UserState> implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor() {
    super({
      name: 'user-store',
      value: {
        id: null,
        username: '',
        email: '',
        profile: {
          firstName: '',
          lastName: '',
          avatar: '',
        },
        preferences: {
          theme: 'light',
          notifications: true,
          language: 'en',
        },
        isAuthenticated: false,
        loading: false,
      },
      schema: UserStateSchema,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Selectors as Observables
  get user$(): Observable<UserState> {
    return this.$subject.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged()
    );
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.$subject.pipe(
      takeUntil(this.destroy$),
      map(state => state.isAuthenticated),
      distinctUntilChanged()
    );
  }

  get loading$(): Observable<boolean> {
    return this.$subject.pipe(
      takeUntil(this.destroy$),
      map(state => state.loading),
      distinctUntilChanged()
    );
  }

  get profile$(): Observable<UserState['profile']> {
    return this.$subject.pipe(
      takeUntil(this.destroy$),
      map(state => state.profile),
      distinctUntilChanged()
    );
  }

  get preferences$(): Observable<UserState['preferences']> {
    return this.$subject.pipe(
      takeUntil(this.destroy$),
      map(state => state.preferences),
      distinctUntilChanged()
    );
  }

  get fullName$(): Observable<string> {
    return this.$subject.pipe(
      takeUntil(this.destroy$),
      map(state => `${state.profile.firstName} ${state.profile.lastName}`.trim()),
      distinctUntilChanged()
    );
  }

  // Actions
  async login(credentials: { username: string; password: string }): Promise<void> {
    this.setLoading(true);
    
    try {
      // Simulate API call
      const response = await this.mockApiLogin(credentials);
      
      this.mutate(draft => {
        draft.id = response.id;
        draft.username = response.username;
        draft.email = response.email;
        draft.profile = response.profile;
        draft.preferences = response.preferences;
        draft.isAuthenticated = true;
        draft.loading = false;
      });
    } catch (error) {
      this.setLoading(false);
      throw error;
    }
  }

  logout(): void {
    this.mutate(draft => {
      draft.id = null;
      draft.username = '';
      draft.email = '';
      draft.profile = {
        firstName: '',
        lastName: '',
        avatar: '',
      };
      draft.isAuthenticated = false;
      draft.loading = false;
    });
  }

  updateProfile(profileData: Partial<UserState['profile']>): void {
    this.mutate(draft => {
      Object.assign(draft.profile, profileData);
    });
  }

  updatePreferences(preferences: Partial<UserState['preferences']>): void {
    this.mutate(draft => {
      Object.assign(draft.preferences, preferences);
    });
  }

  setLoading(loading: boolean): void {
    this.set('loading', loading);
  }

  toggleTheme(): void {
    this.mutate(draft => {
      draft.preferences.theme = draft.preferences.theme === 'light' ? 'dark' : 'light';
    });
  }

  toggleNotifications(): void {
    this.mutate(draft => {
      draft.preferences.notifications = !draft.preferences.notifications;
    });
  }

  // Helper methods
  private async mockApiLogin(credentials: { username: string; password: string }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful response
    return {
      id: 1,
      username: credentials.username,
      email: `${credentials.username}@example.com`,
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://via.placeholder.com/150',
      },
      preferences: {
        theme: 'light' as const,
        notifications: true,
        language: 'en',
      },
    };
  }

  // Validation helpers
  get isProfileComplete(): boolean {
    const { profile } = this.value;
    return !!(profile.firstName && profile.lastName);
  }

  get hasValidEmail(): boolean {
    return this.value.email.includes('@') && this.value.email.includes('.');
  }
}

// Usage in a component:
/*
@Component({
  selector: 'app-user-profile',
  template: `
    <div *ngIf="userStore.loading$ | async">Loading...</div>
    
    <div *ngIf="userStore.isAuthenticated$ | async; else loginForm">
      <h2>Welcome, {{ userStore.fullName$ | async }}!</h2>
      <p>Email: {{ (userStore.user$ | async)?.email }}</p>
      
      <button (click)="userStore.toggleTheme()">
        Switch to {{ (userStore.preferences$ | async)?.theme === 'light' ? 'Dark' : 'Light' }} Theme
      </button>
      
      <button (click)="userStore.logout()">Logout</button>
    </div>
    
    <ng-template #loginForm>
      <!-- Login form here -->
    </ng-template>
  `
})
export class UserProfileComponent {
  constructor(public userStore: UserStoreService) {}
}
*/
