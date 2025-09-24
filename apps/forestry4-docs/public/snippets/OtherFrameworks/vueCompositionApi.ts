// Vue 3 Composition API with Forestry
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { userStore } from './userStore';
import type { Subscription } from 'rxjs';

export function useUserStore() {
  // Reactive references
  const userState = ref(userStore.value);
  const errors = ref([]);
  
  // Subscriptions
  let stateSubscription: Subscription | null = null;
  let errorSubscription: Subscription | null = null;

  // Computed properties
  const isFormValid = computed(() => userStore.isValid);
  const displayName = computed(() => userStore.displayName);
  
  const nameError = computed(() => 
    getFieldError('name')
  );
  
  const emailError = computed(() => 
    getFieldError('email')
  );
  
  const ageError = computed(() => 
    getFieldError('age')
  );

  // Methods
  const updateName = (name: string) => {
    userStore.updateName(name);
  };

  const updateEmail = (email: string) => {
    userStore.updateEmail(email);
  };

  const updateAge = (age: number) => {
    userStore.updateAge(age);
  };

  const toggleActive = () => {
    userStore.toggleActive();
  };

  const getFieldError = (fieldName: string) => {
    const error = errors.value.find(err => 
      err.path?.includes(fieldName)
    );
    return error?.message || '';
  };

  const handleSubmit = () => {
    if (isFormValid.value) {
      console.log('Saving user:', userState.value);
      // Handle form submission
      return true;
    }
    return false;
  };

  // Lifecycle hooks
  onMounted(() => {
    // Subscribe to store state changes
    stateSubscription = userStore.$subject.subscribe((newState) => {
      userState.value = newState;
    });

    // Subscribe to validation errors
    errorSubscription = userStore.$quality.subscribe((newErrors) => {
      errors.value = newErrors;
    });
  });

  onUnmounted(() => {
    // Clean up subscriptions
    if (stateSubscription) {
      stateSubscription.unsubscribe();
    }
    if (errorSubscription) {
      errorSubscription.unsubscribe();
    }
  });

  // Return reactive state and methods
  return {
    // State
    userState,
    errors,
    
    // Computed
    isFormValid,
    displayName,
    nameError,
    emailError,
    ageError,
    
    // Methods
    updateName,
    updateEmail,
    updateAge,
    toggleActive,
    handleSubmit,
    getFieldError,
  };
}

// Usage in a Vue 3 component:
/*
<script setup>
import { useUserStore } from './composables/useUserStore';

const {
  userState,
  isFormValid,
  displayName,
  nameError,
  emailError,
  ageError,
  updateName,
  updateEmail,
  updateAge,
  toggleActive,
  handleSubmit,
} = useUserStore();
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input 
      :value="userState.name"
      @input="updateName($event.target.value)"
      :class="{ error: nameError }"
    />
    <span v-if="nameError">{{ nameError }}</span>
    
    <!-- More form fields... -->
    
    <button :disabled="!isFormValid">Save</button>
  </form>
</template>
*/
