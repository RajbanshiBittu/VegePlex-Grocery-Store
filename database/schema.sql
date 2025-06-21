-- Cart table to store user's cart items
CREATE TABLE IF NOT EXISTS cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid VARCHAR(100),
    product_id INT,
    quantity INT DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(userid),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Products table to store all product information
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    discount_percentage INT,
    category ENUM('vegetables', 'fruits', 'juices', 'others') NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    unit ENUM('kg', 'lit', 'piece') NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_order_quantity INT DEFAULT 1,
    max_order_quantity INT DEFAULT 50,
    rating DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    is_organic BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_is_featured (is_featured)
);

-- Insert sample products
INSERT INTO products (name, description, price, original_price, discount_percentage, category, image_url, unit, stock_quantity, is_organic, rating) VALUES
('Organic Tomato', 'Fresh organic tomatoes sourced directly from local farmers', 2.00, 3.00, 45, 'vegetables', '/Frontend/Pictures/tomato.avif', 'kg', 100, true, 4.5),
('Fresh Onion', 'Premium quality onions with long shelf life', 2.00, 3.00, 33, 'vegetables', '/Frontend/Pictures/onion.jpeg', 'kg', 150, false, 4.5),
('Garlic', 'Fresh and aromatic garlic bulbs', 2.00, 3.00, 25, 'vegetables', '/Frontend/Pictures/garlic.jpeg', 'kg', 80, false, 4.5),
('Organic Potato', 'Farm-fresh organic potatoes', 2.00, 3.00, 33, 'vegetables', '/Frontend/Pictures/potato.avif', 'kg', 200, true, 4.5),
('Green Chilis', 'Fresh and spicy green chilis', 2.00, 3.00, 33, 'vegetables', '/Frontend/Pictures/green chili.jpeg', 'kg', 50, false, 4.5),
('Carrot', 'Sweet and crunchy carrots', 2.00, 3.00, 33, 'vegetables', '/Frontend/Pictures/carrot.jpeg', 'kg', 120, false, 4.5),
('Orange Juice', 'Fresh squeezed orange juice', 3.50, 4.50, 22, 'juices', '/Frontend/Pictures/orange-juice.jpg', 'lit', 50, true, 4.8),
('Apple', 'Fresh red apples', 2.50, 3.00, 17, 'fruits', '/Frontend/Pictures/apple.jpg', 'kg', 100, false, 4.6); 