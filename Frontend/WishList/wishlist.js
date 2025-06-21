// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = '../login/login.html';
}

// Get wishlist container
const wishlistContainer = document.querySelector('.wishlist-items');
const emptyWishlistMessage = document.querySelector('.empty-wishlist-message');

// Function to load wishlist items
const loadWishlist = () => {
    // Get wishlist from localStorage
    const wishlist = JSON.parse(localStorage.getItem(`wishlist_${user.email}`)) || [];
    
    if (wishlist.length === 0) {
        wishlistContainer.style.display = 'none';
        emptyWishlistMessage.style.display = 'block';
        return;
    }

    wishlistContainer.style.display = 'grid';
    emptyWishlistMessage.style.display = 'none';
    
    // Clear existing items
    wishlistContainer.innerHTML = '';
    
    // Add each item to the container
    wishlist.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'wishlist-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="price">₹${item.price}</p>
                <div class="item-actions">
                    <button onclick="addToCart('${item.id}')" class="add-to-cart-btn">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button onclick="removeFromWishlist('${item.id}')" class="remove-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        wishlistContainer.appendChild(itemElement);
    });
};

// Function to remove item from wishlist
const removeFromWishlist = (itemId) => {
    let wishlist = JSON.parse(localStorage.getItem(`wishlist_${user.email}`)) || [];
    wishlist = wishlist.filter(item => item.id !== itemId);
    localStorage.setItem(`wishlist_${user.email}`, JSON.stringify(wishlist));
    loadWishlist();
};

// Function to add item to cart
const addToCart = (itemId) => {
    const wishlist = JSON.parse(localStorage.getItem(`wishlist_${user.email}`)) || [];
    const item = wishlist.find(item => item.id === itemId);
    
    if (item) {
        // Get existing cart
        let cart = JSON.parse(localStorage.getItem(`cart_${user.email}`)) || [];
        
        // Check if item already in cart
        const existingItem = cart.find(cartItem => cartItem.id === itemId);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        
        // Save updated cart
        localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
        
        // Remove from wishlist
        removeFromWishlist(itemId);
        
        alert('Item added to cart!');
    }
};

// Load wishlist when page loads
document.addEventListener('DOMContentLoaded', loadWishlist);
