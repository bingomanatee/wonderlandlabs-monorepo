// Strategic Actions - High-level orchestration methods
// These actions coordinate multiple tactical operations

// User registration workflow
async registerUser(userData: UserRegistrationData) {
  // Validate input
  this.validateUserData(userData);
  
  // Create user account
  this.createUserAccount(userData);
  
  // Set up default preferences
  this.initializeUserPreferences();
  
  // Send welcome email
  await this.sendWelcomeEmail(userData.email);
  
  // Log registration event
  this.logUserEvent('registration', { userId: this.value.id });
}

// Shopping cart checkout process
async processCheckout(paymentInfo: PaymentInfo) {
  // Start transaction for atomicity
  return this.trans(() => {
    // Validate cart contents
    this.validateCartItems();
    
    // Calculate totals
    this.calculateOrderTotals();
    
    // Process payment
    this.processPayment(paymentInfo);
    
    // Create order record
    this.createOrder();
    
    // Clear cart
    this.clearCart();
    
    // Update inventory
    this.updateInventory();
  });
}

// Complex form submission
submitForm(formData: FormData) {
  // Validate all fields
  this.validateAllFields(formData);
  
  // Transform data
  this.transformFormData(formData);
  
  // Save to backend
  this.saveFormData();
  
  // Update UI state
  this.setSubmissionComplete();
}
