import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  Badge,
  Divider,
  SimpleGrid,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Forest } from '@wonderlandlabs/forestry4';
import useObserveForest from '../../hooks/useObserveForest';
import { z } from 'zod';

// Define interfaces
interface UserProfile {
  name: string;
  email: string;
  age: number;
}

interface ShoppingCart {
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
}

interface AppState {
  user: {
    profile: UserProfile;
    preferences: { theme: 'light' | 'dark' };
  };
  cart: ShoppingCart;
  counter: number;
}

// Custom branch classes
class UserProfileBranch extends Forest<UserProfile> {
  get displayName(): string {
    return `${this.value.name} (${this.value.age})`;
  }

  get isAdult(): boolean {
    return this.value.age >= 18;
  }

  updateName(name: string) {
    this.set('name', name);
  }

  updateEmail(email: string) {
    this.set('email', email);
  }

  updateAge(age: number) {
    this.set('age', age);
  }

  celebrateBirthday() {
    this.mutate(draft => {
      draft.age += 1;
    });
  }
}

class ShoppingCartBranch extends Forest<ShoppingCart> {
  get itemCount(): number {
    return this.value.items.length;
  }

  addItem(name: string, price: number) {
    this.mutate(draft => {
      const id = Date.now().toString();
      draft.items.push({ id, name, price, quantity: 1 });
      draft.total += price;
    });
  }

  removeItem(id: string) {
    this.mutate(draft => {
      const index = draft.items.findIndex(item => item.id === id);
      if (index >= 0) {
        const item = draft.items[index];
        draft.total -= item.price * item.quantity;
        draft.items.splice(index, 1);
      }
    });
  }

  clearCart() {
    this.next({ items: [], total: 0 });
  }
}

// Main store
class DemoAppStore extends Forest<AppState> {
  constructor() {
    super({
      value: {
        user: {
          profile: { name: 'John Doe', email: 'john@example.com', age: 25 },
          preferences: { theme: 'light' }
        },
        cart: { items: [], total: 0 },
        counter: 0
      },
      name: 'demo-app'
    });
  }

  getUserProfile(): UserProfileBranch {
    return this.$branch<UserProfile, UserProfileBranch>(['user', 'profile'], {
      subclass: UserProfileBranch,
      schema: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
        age: z.number().min(0).max(150)
      })
    });
  }

  getShoppingCart(): ShoppingCartBranch {
    return this.$branch<ShoppingCart, ShoppingCartBranch>(['cart'], {
      subclass: ShoppingCartBranch
    });
  }

  incrementCounter() {
    this.mutate(draft => {
      draft.counter += 1;
    });
  }
}

// Create store instance
const demoStore = new DemoAppStore();

// User Profile Component
const UserProfileCard: React.FC = () => {
  const userProfile = demoStore.getUserProfile();
  const profileData = useObserveForest(userProfile);
  const [error, setError] = useState<string>('');

  const handleUpdate = (field: keyof UserProfile, value: string | number) => {
    try {
      setError('');
      if (field === 'name') userProfile.updateName(value as string);
      else if (field === 'email') userProfile.updateEmail(value as string);
      else if (field === 'age') userProfile.updateAge(Number(value));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <Heading size="md">User Profile Branch</Heading>
        <Text fontSize="sm" color="gray.600">
          Path: ['user', 'profile']
        </Text>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {error && (
            <Alert status="error" size="sm">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <Box>
            <Text fontWeight="bold">Display Name: {userProfile.displayName}</Text>
            <Badge colorScheme={userProfile.isAdult ? 'green' : 'orange'}>
              {userProfile.isAdult ? 'Adult' : 'Minor'}
            </Badge>
          </Box>

          <Input
            placeholder="Name"
            value={profileData.name}
            onChange={e => handleUpdate('name', e.target.value)}
          />
          
          <Input
            placeholder="Email"
            value={profileData.email}
            onChange={e => handleUpdate('email', e.target.value)}
          />
          
          <Input
            type="number"
            placeholder="Age"
            value={profileData.age}
            onChange={e => handleUpdate('age', e.target.value)}
          />

          <Button onClick={() => userProfile.celebrateBirthday()}>
            🎂 Celebrate Birthday
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Shopping Cart Component
const ShoppingCartCard: React.FC = () => {
  const cart = demoStore.getShoppingCart();
  const cartData = useObserveForest(cart);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const addItem = () => {
    if (itemName && itemPrice) {
      cart.addItem(itemName, parseFloat(itemPrice));
      setItemName('');
      setItemPrice('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Shopping Cart Branch</Heading>
        <Text fontSize="sm" color="gray.600">
          Path: ['cart']
        </Text>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontWeight="bold">Items: {cart.itemCount}</Text>
            <Text fontWeight="bold">Total: ${cartData.total.toFixed(2)}</Text>
          </Box>

          <HStack>
            <Input
              placeholder="Item name"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Price"
              value={itemPrice}
              onChange={e => setItemPrice(e.target.value)}
            />
            <Button onClick={addItem} colorScheme="blue">
              Add
            </Button>
          </HStack>

          <VStack spacing={2} align="stretch">
            {cartData.items.map(item => (
              <HStack key={item.id} justify="space-between">
                <Text>{item.name} - ${item.price}</Text>
                <Button size="sm" onClick={() => cart.removeItem(item.id)}>
                  Remove
                </Button>
              </HStack>
            ))}
          </VStack>

          {cartData.items.length > 0 && (
            <Button onClick={() => cart.clearCart()} colorScheme="red" variant="outline">
              Clear Cart
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Main App State Display
const AppStateCard: React.FC = () => {
  const appData = useObserveForest(demoStore);

  return (
    <Card>
      <CardHeader>
        <Heading size="md">Full App State</Heading>
        <Text fontSize="sm" color="gray.600">
          Root store - all branches sync here
        </Text>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontWeight="bold">Counter: {appData.counter}</Text>
            <Button onClick={() => demoStore.incrementCounter()}>
              Increment Counter
            </Button>
          </Box>
          
          <Divider />
          
          <Box>
            <Text fontSize="sm" fontFamily="mono" whiteSpace="pre-wrap">
              {JSON.stringify(appData, null, 2)}
            </Text>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Main Demo Component
const BranchingDemo: React.FC = () => {
  return (
    <Box>
      <Text mb={4} color="gray.600">
        This demo shows how branches work in practice. Each card represents a different branch
        of the same root store. Notice how changes in branches automatically sync with the
        parent store and other branches.
      </Text>
      
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <UserProfileCard />
        <ShoppingCartCard />
      </SimpleGrid>
      
      <Box mt={6}>
        <AppStateCard />
      </Box>
    </Box>
  );
};

export default BranchingDemo;
