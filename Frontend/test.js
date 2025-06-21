// Test data
const testUser = {
    email: 'test@example.com',
    fullname: 'Test User',
    phone: '1234567890'
};

const testProduct = {
    id: 'test-product-1',
    name: 'Fresh Tomatoes',
    price: 40,
    image: '../Frontend/Pictures/tomato.jpg'
};

// Test functions
function runTests() {
    console.log('Starting tests...');
    
    // Clear existing data
    localStorage.clear();
    
    // Test 1: Authentication Check
    console.log('\nTest 1: Authentication Check');
    testAuthenticationRedirect();
    
    // Test 2: Login Simulation
    console.log('\nTest 2: Login Simulation');
    simulateLogin();
    
    // Test 3: Empty States
    console.log('\nTest 3: Empty States');
    testEmptyStates();
    
    // Test 4: Wishlist Operations
    console.log('\nTest 4: Wishlist Operations');
    testWishlistOperations();
    
    // Test 5: Cart Operations
    console.log('\nTest 5: Cart Operations');
    testCartOperations();
    
    // Test 6: Integration Tests
    console.log('\nTest 6: Integration Tests');
    testIntegration();
}

function testAuthenticationRedirect() {
    // Clear user data
    localStorage.removeItem('user');
    
    try {
        // Try to access wishlist
        window.location.href = 'WishList/wishlist.html';
        console.error('❌ Wishlist should redirect when not logged in');
    } catch (e) {
        console.log('✅ Wishlist redirects when not logged in');
    }
    
    try {
        // Try to access cart
        window.location.href = 'UserCart/cart.html';
        console.error('❌ Cart should redirect when not logged in');
    } catch (e) {
        console.log('✅ Cart redirects when not logged in');
    }
}

function simulateLogin() {
    localStorage.setItem('user', JSON.stringify(testUser));
    const user = JSON.parse(localStorage.getItem('user'));
    console.log(user ? '✅ Login simulation successful' : '❌ Login simulation failed');
}

function testEmptyStates() {
    // Check empty wishlist
    const wishlist = JSON.parse(localStorage.getItem(`wishlist_${testUser.email}`)) || [];
    console.log(wishlist.length === 0 ? '✅ Empty wishlist state correct' : '❌ Wishlist should be empty');
    
    // Check empty cart
    const cart = JSON.parse(localStorage.getItem(`cart_${testUser.email}`)) || [];
    console.log(cart.length === 0 ? '✅ Empty cart state correct' : '❌ Cart should be empty');
}

function testWishlistOperations() {
    // Add to wishlist
    let wishlist = JSON.parse(localStorage.getItem(`wishlist_${testUser.email}`)) || [];
    wishlist.push(testProduct);
    localStorage.setItem(`wishlist_${testUser.email}`, JSON.stringify(wishlist));
    
    // Verify addition
    wishlist = JSON.parse(localStorage.getItem(`wishlist_${testUser.email}`)) || [];
    console.log(wishlist.length === 1 ? '✅ Add to wishlist successful' : '❌ Add to wishlist failed');
    
    // Remove from wishlist
    wishlist = wishlist.filter(item => item.id !== testProduct.id);
    localStorage.setItem(`wishlist_${testUser.email}`, JSON.stringify(wishlist));
    
    // Verify removal
    wishlist = JSON.parse(localStorage.getItem(`wishlist_${testUser.email}`)) || [];
    console.log(wishlist.length === 0 ? '✅ Remove from wishlist successful' : '❌ Remove from wishlist failed');
}

function testCartOperations() {
    // Add to cart
    let cart = JSON.parse(localStorage.getItem(`cart_${testUser.email}`)) || [];
    cart.push({...testProduct, quantity: 1});
    localStorage.setItem(`cart_${testUser.email}`, JSON.stringify(cart));
    
    // Verify addition
    cart = JSON.parse(localStorage.getItem(`cart_${testUser.email}`)) || [];
    console.log(cart.length === 1 ? '✅ Add to cart successful' : '❌ Add to cart failed');
    
    // Update quantity
    cart[0].quantity = 2;
    localStorage.setItem(`cart_${testUser.email}`, JSON.stringify(cart));
    
    // Verify quantity update
    cart = JSON.parse(localStorage.getItem(`cart_${testUser.email}`)) || [];
    console.log(cart[0].quantity === 2 ? '✅ Quantity update successful' : '❌ Quantity update failed');
    
    // Test shipping calculation
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 40;
    console.log(shipping === 40 ? '✅ Shipping calculation correct' : '❌ Shipping calculation failed');
    
    // Remove from cart
    cart = cart.filter(item => item.id !== testProduct.id);
    localStorage.setItem(`cart_${testUser.email}`, JSON.stringify(cart));
    
    // Verify removal
    cart = JSON.parse(localStorage.getItem(`cart_${testUser.email}`)) || [];
    console.log(cart.length === 0 ? '✅ Remove from cart successful' : '❌ Remove from cart failed');
}

function testIntegration() {
    // Add to wishlist
    let wishlist = [testProduct];
    localStorage.setItem(`wishlist_${testUser.email}`, JSON.stringify(wishlist));
    
    // Move from wishlist to cart
    let cart = JSON.parse(localStorage.getItem(`cart_${testUser.email}`)) || [];
    cart.push({...testProduct, quantity: 1});
    localStorage.setItem(`cart_${testUser.email}`, JSON.stringify(cart));
    
    wishlist = wishlist.filter(item => item.id !== testProduct.id);
    localStorage.setItem(`wishlist_${testUser.email}`, JSON.stringify(wishlist));
    
    // Verify integration
    wishlist = JSON.parse(localStorage.getItem(`wishlist_${testUser.email}`)) || [];
    cart = JSON.parse(localStorage.getItem(`cart_${testUser.email}`)) || [];
    
    console.log(wishlist.length === 0 && cart.length === 1 ? 
        '✅ Wishlist to cart integration successful' : 
        '❌ Wishlist to cart integration failed');
}

// Run tests
runTests(); 