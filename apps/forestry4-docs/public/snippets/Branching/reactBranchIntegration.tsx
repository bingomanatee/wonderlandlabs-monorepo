// React Integration with Branches
import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';
import useObserveForest from '../hooks/useObserveForest'; // Local hook

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface AppState {
  user: {
    profile: UserProfile;
    preferences: { theme: 'light' | 'dark' };
  };
  cart: {
    items: Array<{ id: string; name: string; price: number }>;
  };
}

class UserProfileBranch extends Forest<UserProfile> {
  updateName(name: string) {
    this.set('name', name);
  }

  updateEmail(email: string) {
    this.set('email', email);
  }

  get displayName() {
    return this.value.name || 'Anonymous User';
  }
}

class AppStore extends Forest<AppState> {
  constructor() {
    super({
      value: {
        user: {
          profile: { name: 'John Doe', email: 'john@example.com' },
          preferences: { theme: 'light' }
        },
        cart: { items: [] }
      }
    });
  }

  getUserProfile(): UserProfileBranch {
    return this.$branch(['user', 'profile'], {
      subclass: UserProfileBranch
    });
  }
}

// Global app store instance
const appStore = new AppStore();

// Component that uses a specific branch
const UserProfileCard: React.FC = () => {
  // Get the branch instance
  const userProfile = appStore.getUserProfile();
  
  // Subscribe to branch changes
  const profileData = useObserveForest(userProfile);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    userProfile.updateName(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    userProfile.updateEmail(e.target.value);
  };

  return (
    <div className="user-profile-card">
      <h2>User Profile</h2>
      <div>
        <label>
          Name:
          <input
            type="text"
            value={profileData.name}
            onChange={handleNameChange}
          />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input
            type="email"
            value={profileData.email}
            onChange={handleEmailChange}
          />
        </label>
      </div>
      <div>
        <strong>Display Name:</strong> {userProfile.displayName}
      </div>
    </div>
  );
};

// Another component using a different branch
const ShoppingCartSummary: React.FC = () => {
  const cartBranch = appStore.$branch(['cart'], {});
  const cartData = useObserveForest(cartBranch);

  return (
    <div className="cart-summary">
      <h3>Cart Summary</h3>
      <p>Items: {cartData.items.length}</p>
      <p>Total: ${cartData.items.reduce((sum, item) => sum + item.price, 0)}</p>
    </div>
  );
};

// Main app component
const App: React.FC = () => {
  return (
    <div className="app">
      <UserProfileCard />
      <ShoppingCartSummary />
    </div>
  );
};

export default App;
