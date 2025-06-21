import products from '../Product.js';

console.log('Products loaded:', products);

const productContainer = document.querySelector(".product-list");
const isProductDetailPage = document.querySelector(".product-detail");
const isCartPage = document.querySelector(".cart");
const isWishlistPage = document.querySelector(".wishlist");

console.log('Product container:', productContainer);

if(productContainer){
    console.log('Displaying products...');
    try {
        displayProducts();
    } catch (error) {
        console.error('Error displaying products:', error);
    }
}else if(isProductDetailPage){
    displayProductDetail();
}else if(isCartPage){
    displayCart();
}else if(isWishlistPage){
    displayWishlist();
}

function displayProducts(){
    if (!productContainer) {
        console.error('Product container not found');
        return;
    }
    if (!products || !Array.isArray(products)) {
        console.error('Products not loaded correctly:', products);
        return;
    }

    products.forEach(product => {
        console.log('Creating card for:', product.title);
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        // Check if product is in wishlist
        const wishlist = JSON.parse(sessionStorage.getItem("wishlist")) || [];
        const isInWishlist = wishlist.some(item => item.id === product.id);

        productCard.innerHTML = `
            <div class="img-box">
                <img src="${product.variants[0].mainImage}" alt="${product.title}" loading="lazy">
                <button class="wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}" data-product-id="${product.id}">
                    <i class="ri-heart-${isInWishlist ? 'fill' : 'line'}"></i>
                </button>
            </div>
            <h2 class="title">${product.title}</h2>
            <div class="price">${product.price} <span>${product.oldPrice}</span></div>
        `;
        productContainer.appendChild(productCard);
    
        // Add click event for product card (excluding wishlist button)
        const imgBox = productCard.querySelector(".img-box");
        imgBox.addEventListener("click", (e) => {
            // Don't navigate if clicking the wishlist button
            if (!e.target.closest('.wishlist-btn')) {
                sessionStorage.setItem("selectedProduct", JSON.stringify({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    oldPrice: product.oldPrice,
                    discount: product.discount,
                    description: `Fresh and high-quality ${product.title.toLowerCase()}.`,
                    mainImage: product.variants[0].mainImage,
                    thumbnails: [product.variants[0].mainImage, product.variants[0].mainImage, product.variants[0].mainImage],
                    colors: [
                        {
                            name: "Fresh",
                            mainImage: product.variants[0].mainImage,
                            sizes: ["1 kg", "2 kg", "5 kg"]
                        }
                    ],
                    sizes: ["1 kg", "2 kg", "5 kg"]
                }));
                window.location.href = "/Frontend/Products/product-details.html";
            }
        });

        // Add wishlist button functionality
        const wishlistBtn = productCard.querySelector(".wishlist-btn");
        wishlistBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // Prevent card click
            const productId = wishlistBtn.getAttribute('data-product-id');
            let wishlist = JSON.parse(sessionStorage.getItem("wishlist")) || [];
            const existingIndex = wishlist.findIndex(item => item.id === productId);

            if (existingIndex !== -1) {
                // Remove from wishlist
                wishlist.splice(existingIndex, 1);
                wishlistBtn.classList.remove('in-wishlist');
                wishlistBtn.innerHTML = '<i class="ri-heart-line"></i>';
            } else {
                // Add to wishlist
                wishlist.push({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.variants[0].mainImage,
                    size: "1 kg" // Default size
                });
                wishlistBtn.classList.add('in-wishlist');
                wishlistBtn.innerHTML = '<i class="ri-heart-fill"></i>';
            }

            sessionStorage.setItem("wishlist", JSON.stringify(wishlist));
            updateWishlistBadge();
        });
    });
}

function displayProductDetail(){
    console.log('Displaying product detail');
    const productData = JSON.parse(sessionStorage.getItem("selectedProduct"));
    console.log('Product data:', productData);

    if (!productData) {
        console.error('No product data found');
        return;
    }

    const titleEl = document.querySelector(".title");
    const priceEl = document.querySelector(".price");
    const descriptionEl = document.querySelector(".description");
    const mainImageContainer = document.querySelector(".main-img");
    const thumbnailContainer = document.querySelector(".thumbnail-list");
    const colorContainer = document.querySelector(".color-options");
    const sizeContainer = document.querySelector(".size-options");
    const addToCartBtn = document.querySelector("#add-cart-btn");
    const addToWishlistBtn = document.querySelector("#add-wishlist-btn");

    if (!titleEl || !priceEl || !descriptionEl || !mainImageContainer || !thumbnailContainer || 
        !colorContainer || !sizeContainer || !addToCartBtn || !addToWishlistBtn) {
        console.error('Required elements not found');
        return;
    }

    let selectedColor = productData.colors[0];
    let selectedSize = productData.sizes[0];

    // Update main product info
    titleEl.textContent = productData.title;
    priceEl.textContent = productData.price;
    descriptionEl.textContent = productData.description;

    // Update main image
    mainImageContainer.innerHTML = `<img src="${productData.mainImage}" alt="${productData.title}">`;

    // Update thumbnails
    thumbnailContainer.innerHTML = '';
    productData.thumbnails.forEach(thumb => {
        const img = document.createElement("img");
        img.src = thumb;
        img.alt = productData.title;
        thumbnailContainer.appendChild(img);

        img.addEventListener("click", () => {
            mainImageContainer.innerHTML = `<img src="${thumb}" alt="${productData.title}">`;
        });
    });

    // Update size options
    sizeContainer.innerHTML = '';
    productData.sizes.forEach(size => {
        const btn = document.createElement("button");
        btn.textContent = size;
        if(size === selectedSize) btn.classList.add("selected");
        sizeContainer.appendChild(btn);

        btn.addEventListener("click", () => {
            document.querySelectorAll(".size-options button").forEach(el => el.classList.remove("selected"));
            btn.classList.add("selected");
            selectedSize = size;
        });
    });

    // Add to cart functionality
    addToCartBtn.addEventListener("click", () => {
        const cartItem = {
            id: productData.id,
            title: productData.title,
            price: productData.price,
            image: productData.mainImage,
            size: selectedSize,
            quantity: 1
        };

        let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        
        // Check if the exact same product with same size exists
        const existingItemIndex = cart.findIndex(item => 
            item.id === cartItem.id && 
            item.size === cartItem.size
        );

        if(existingItemIndex !== -1) {
            // Update quantity of existing item
            cart[existingItemIndex].quantity += 1;
        } else {
            // Add new item
            cart.push(cartItem);
        }

        sessionStorage.setItem("cart", JSON.stringify(cart));
        updateCartBadge();

        const confirmResult = confirm('Product added to cart! Would you like to view your cart?');
        if (confirmResult) {
            window.location.href = '../UserCart/cart.html';
        } else {
            window.location.href = '/Frontend/Index.html';
        }
    });

    // Add wishlist functionality
    const wishlist = JSON.parse(sessionStorage.getItem("wishlist")) || [];
    const isInWishlist = wishlist.some(item => item.id === productData.id);
    
    // Update wishlist button appearance
    if (isInWishlist) {
        addToWishlistBtn.innerHTML = '<i class="ri-heart-fill"></i>';
        addToWishlistBtn.classList.add('in-wishlist');
    }

    addToWishlistBtn.addEventListener("click", () => {
        const wishlistItem = {
            id: productData.id,
            title: productData.title,
            price: productData.price,
            image: productData.mainImage,
            size: selectedSize
        };

        let wishlist = JSON.parse(sessionStorage.getItem("wishlist")) || [];
        const existingIndex = wishlist.findIndex(item => item.id === wishlistItem.id);

        if (existingIndex !== -1) {
            // Remove from wishlist
            wishlist.splice(existingIndex, 1);
            addToWishlistBtn.innerHTML = '<i class="ri-heart-line"></i>';
            addToWishlistBtn.classList.remove('in-wishlist');
        } else {
            // Add to wishlist
            wishlist.push(wishlistItem);
            addToWishlistBtn.innerHTML = '<i class="ri-heart-fill"></i>';
            addToWishlistBtn.classList.add('in-wishlist');
        }

        sessionStorage.setItem("wishlist", JSON.stringify(wishlist));
        updateWishlistBadge();
    });
}

function displayCart(){
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    console.log('Displaying cart:', cart);

    const cartItemsContainer = document.querySelector(".cart-items");
    const subtotalEl = document.querySelector(".subtotal");
    const grandTotalEl = document.querySelector(".grand-total");

    if (!cartItemsContainer || !subtotalEl || !grandTotalEl) {
        console.error('Required cart elements not found');
        return;
    }

    cartItemsContainer.innerHTML = "";

    if(cart.length === 0){
        cartItemsContainer.innerHTML = "<p>Your cart is Empty</p>";
        subtotalEl.textContent = "$0";
        grandTotalEl.textContent = "$0";
        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemPrice = parseFloat(item.price.replace("$", ""));
        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <div class="product">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-detail">
                    <p>${item.title}</p>
                    <div class="size-color-box">
                        <span class="size">${item.size}</span>
                    </div>
                </div>
            </div>
            <span class="price">${item.price}</span>
            <div class="quantity"><input type="number" value="${item.quantity}" min="1" data-index="${index}"></div>
            <span class="total-price">$${itemTotal.toFixed(2)}</span>
            <button class="remove" data-index="${index}"><i class="ri-close-circle-line"></i></button>
        `;

        cartItemsContainer.appendChild(cartItem);
    });

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    grandTotalEl.textContent = `$${subtotal.toFixed(2)}`;

    // Attach event listeners after adding items
    attachCartEventListeners();
}

function attachCartEventListeners() {
    // Update quantity listeners
    document.querySelectorAll(".quantity input").forEach(input => {
        input.addEventListener("change", function() {
            const index = parseInt(this.getAttribute("data-index"));
            const newQuantity = parseInt(this.value);
            
            if(newQuantity < 1) {
                this.value = 1;
                return;
            }
            
            let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
            cart[index].quantity = newQuantity;
            sessionStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
            updateCartBadge();
        });
    });

    // Remove item listeners
    document.querySelectorAll(".remove").forEach(button => {
        button.addEventListener("click", function() {
            const index = parseInt(this.getAttribute("data-index"));
            let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
            
            cart.splice(index, 1);
            sessionStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
            updateCartBadge();
        });
    });
}

function updateCartBadge() {
    const cartCount = document.querySelector(".cart-item-count");
    if (!cartCount) return;

    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCount.textContent = totalItems || "";
    cartCount.style.display = totalItems ? "block" : "none";
}

function displayWishlist() {
    const wishlist = JSON.parse(sessionStorage.getItem("wishlist")) || [];
    console.log('Displaying wishlist:', wishlist);

    const wishlistContainer = document.querySelector(".wishlist-items");
    if (!wishlistContainer) {
        console.error('Wishlist container not found');
        return;
    }

    wishlistContainer.innerHTML = "";

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = `
            <div class="empty-wishlist">
                <i class="ri-heart-line"></i>
                <p>Your wishlist is empty</p>
                <a href="/Frontend/Index.html" class="btn">Continue Shopping</a>
            </div>
        `;
        return;
    }

    wishlist.forEach((item, index) => {
        const wishlistItem = document.createElement("div");
        wishlistItem.classList.add("wishlist-item");
        wishlistItem.innerHTML = `
            <div class="product">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-detail">
                    <p>${item.title}</p>
                    <div class="size-box">
                        <span class="size">${item.size}</span>
                    </div>
                    <span class="price">${item.price}</span>
                </div>
            </div>
            <div class="wishlist-actions">
                <button class="add-to-cart" data-index="${index}">Add to Cart</button>
                <button class="remove-wishlist" data-index="${index}">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `;

        wishlistContainer.appendChild(wishlistItem);
    });

    // Add event listeners for wishlist actions
    attachWishlistEventListeners();
}

function attachWishlistEventListeners() {
    // Add to cart from wishlist
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function() {
            const index = parseInt(this.getAttribute("data-index"));
            const wishlist = JSON.parse(sessionStorage.getItem("wishlist")) || [];
            const item = wishlist[index];

            // Add to cart
            const cartItem = {
                id: item.id,
                title: item.title,
                price: item.price,
                image: item.image,
                size: item.size,
                quantity: 1
            };

            let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
            const existingItemIndex = cart.findIndex(cartItem => 
                cartItem.id === item.id && 
                cartItem.size === item.size
            );

            if(existingItemIndex !== -1) {
                cart[existingItemIndex].quantity += 1;
            } else {
                cart.push(cartItem);
            }

            sessionStorage.setItem("cart", JSON.stringify(cart));
            updateCartBadge();

            // Remove from wishlist
            wishlist.splice(index, 1);
            sessionStorage.setItem("wishlist", JSON.stringify(wishlist));
            updateWishlistBadge();
            displayWishlist();
        });
    });

    // Remove from wishlist
    document.querySelectorAll(".remove-wishlist").forEach(button => {
        button.addEventListener("click", function() {
            const index = parseInt(this.getAttribute("data-index"));
            let wishlist = JSON.parse(sessionStorage.getItem("wishlist")) || [];
            
            wishlist.splice(index, 1);
            sessionStorage.setItem("wishlist", JSON.stringify(wishlist));
            updateWishlistBadge();
            displayWishlist();
        });
    });
}

function updateWishlistBadge() {
    const wishlistCount = document.querySelector(".wishlist-item-count");
    if (!wishlistCount) return;

    const wishlist = JSON.parse(sessionStorage.getItem("wishlist")) || [];
    const totalItems = wishlist.length;
    
    wishlistCount.textContent = totalItems || "";
    wishlistCount.style.display = totalItems ? "block" : "none";
}

// Initialize badges and display on page load
updateCartBadge();
updateWishlistBadge();

if (isCartPage) {
    displayCart();
} else if (isWishlistPage) {
    displayWishlist();
}

// Add styles for wishlist
const style = document.createElement('style');
style.textContent = `
    .nav-icons {
        display: flex;
        gap: 20px;
        align-items: center;
    }
    .wishlist-icon {
        position: relative;
        color: inherit;
        text-decoration: none;
    }
    .wishlist-item-count {
        position: absolute;
        top: -8px;
        right: -8px;
        background:rgb(80, 165, 250);
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 12px;
        display: none;
        justify-content: center;
        align-items: center;
    }
    .product-actions {
        display: flex;
        gap: 10px;
        margin: 20px 0;
    }
    .wishlist-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 10px;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .wishlist-btn:hover {
        background: #e74c3c;
        color: white;
        transform: scale(1.05);
    }
    .wishlist-btn.in-wishlist {
        background: #e74c3c;
        color: white;
    }
    .wishlist-btn.in-wishlist:hover {
        background: #c0392b;
    }
    .wishlist-btn i {
        font-size: 20px;
    }
    .wishlist {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }
    .wishlist h2 {
        margin-bottom: 20px;
    }
    .wishlist-items {
        display: grid;
        gap: 20px;
    }
    .wishlist-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
    }
    .wishlist-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .wishlist-item .product {
        display: flex;
        gap: 15px;
        align-items: center;
    }
    .wishlist-item img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 4px;
    }
    .wishlist-actions {
        display: flex;
        gap: 10px;
    }
    .add-to-cart {
        padding: 8px 16px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .add-to-cart:hover {
        background: #45a049;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .remove-wishlist {
        padding: 8px;
        background: #e74c3c;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .remove-wishlist:hover {
        background: #c0392b;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .empty-wishlist {
        text-align: center;
        padding: 40px;
    }
    .empty-wishlist i {
        font-size: 48px;
        color: #ccc;
        margin-bottom: 20px;
    }
    .wishlist-icon:hover {
        color: #e74c3c;
        transform: scale(1.1);
    }
    .cart-icon:hover {
        color: #4CAF50;
        transform: scale(1.1);
    }
    .product-img {
        position: relative;
    }
    .img-box {
        position: relative;
        overflow: hidden;
        border-radius: 8px;
    }
    .img-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }
    .img-box:hover img {
        transform: scale(1.05);
    }
`;
document.head.appendChild(style); 