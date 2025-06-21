// server.js
const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const db = require('../database');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.post('/api/register', (req, res) => {
    const { email, password, fullname, phone } = req.body;

    // Check if user already exists
    db.query('SELECT userid FROM users WHERE userid = ?', [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            const userData = {
                userid: email,
                password: hashedPassword,
                fullname: fullname,
                phone: phone
            };

            db.query('INSERT INTO users SET ?', userData, (err, result) => {
                if (err) {
                    console.error('Registration error:', err);
                    return res.status(500).json({ message: 'Registration failed' });
                }

                res.status(201).json({
                    message: 'Registration successful! Your User ID is your email.',
                    user: { email, fullname, phone }
                });
            });
        } catch (error) {
            console.error('Server error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Find user by email (userid)
    db.query('SELECT * FROM users WHERE userid = ?', [email], async (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];

        try {
            // Compare password
            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Update last login time
            db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE userid = ?', [email]);

            // Send success response
            res.json({
                message: 'Login successful!',
                user: {
                    email: user.userid,
                    fullname: user.fullname,
                    phone: user.phone
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});

app.post('/api/update-profile', async (req, res) => {
    const { userid, fullname, email, phone, currentPassword, newPassword } = req.body;

    try {
        // First verify the user exists
        const [user] = await db.query('SELECT * FROM users WHERE userid = ?', [userid]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If password is being changed, verify current password
        if (currentPassword && newPassword) {
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }
        }

        // Prepare update data
        const updateData = {
            fullname,
            phone
        };

        // If email is being changed, check if new email already exists
        if (email !== userid) {
            const [existingUser] = await db.query('SELECT userid FROM users WHERE userid = ?', [email]);
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            updateData.userid = email;
        }

        // If password is being changed, hash new password
        if (newPassword) {
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // Update user profile
        await db.query('UPDATE users SET ? WHERE userid = ?', [updateData, userid]);

        res.json({
            message: 'Profile updated successfully',
            user: {
                email: updateData.userid || userid,
                fullname,
                phone
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

// Cart API endpoints
app.post('/api/cart/add', (req, res) => {
    const { userid, product_id, quantity } = req.body;
    
    // Check if item already exists in cart
    db.query(
        'SELECT * FROM cart_items WHERE userid = ? AND product_id = ?',
        [userid, product_id],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (results.length > 0) {
                // Update quantity if item exists
                const newQuantity = results[0].quantity + (quantity || 1);
                db.query(
                    'UPDATE cart_items SET quantity = ? WHERE userid = ? AND product_id = ?',
                    [newQuantity, userid, product_id],
                    (err) => {
                        if (err) {
                            console.error('Update error:', err);
                            return res.status(500).json({ message: 'Failed to update cart' });
                        }
                        res.json({ message: 'Cart updated successfully' });
                    }
                );
            } else {
                // Add new item to cart
                db.query(
                    'INSERT INTO cart_items (userid, product_id, quantity) VALUES (?, ?, ?)',
                    [userid, product_id, quantity || 1],
                    (err) => {
                        if (err) {
                            console.error('Insert error:', err);
                            return res.status(500).json({ message: 'Failed to add to cart' });
                        }
                        res.json({ message: 'Item added to cart successfully' });
                    }
                );
            }
        }
    );
});

app.get('/api/cart/:userid', (req, res) => {
    const { userid } = req.params;
    
    db.query(
        `SELECT ci.*, p.name, p.price, p.image_url 
         FROM cart_items ci 
         JOIN products p ON ci.product_id = p.id 
         WHERE ci.userid = ?`,
        [userid],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.json(results);
        }
    );
});

app.delete('/api/cart/:userid/:product_id', (req, res) => {
    const { userid, product_id } = req.params;
    
    db.query(
        'DELETE FROM cart_items WHERE userid = ? AND product_id = ?',
        [userid, product_id],
        (err) => {
            if (err) {
                console.error('Delete error:', err);
                return res.status(500).json({ message: 'Failed to remove item from cart' });
            }
            res.json({ message: 'Item removed from cart successfully' });
        }
    );
});

app.put('/api/cart/:userid/:product_id', (req, res) => {
    const { userid, product_id } = req.params;
    const { quantity } = req.body;
    
    db.query(
        'UPDATE cart_items SET quantity = ? WHERE userid = ? AND product_id = ?',
        [quantity, userid, product_id],
        (err) => {
            if (err) {
                console.error('Update error:', err);
                return res.status(500).json({ message: 'Failed to update quantity' });
            }
            res.json({ message: 'Quantity updated successfully' });
        }
    );
});

// Clear cart (for checkout)
app.post('/api/cart/clear', (req, res) => {
    const { userid } = req.body;
    
    db.query(
        'DELETE FROM cart_items WHERE userid = ?',
        [userid],
        (err) => {
            if (err) {
                console.error('Clear cart error:', err);
                return res.status(500).json({ message: 'Failed to clear cart' });
            }
            res.json({ message: 'Cart cleared successfully' });
        }
    );
});

// Product API endpoints

// Get all products with optional filtering
app.get('/api/products', (req, res) => {
    const { 
        category,
        is_organic,
        is_featured,
        min_price,
        max_price,
        search,
        sort_by,
        sort_order,
        page = 1,
        limit = 12
    } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    // Apply filters
    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    if (is_organic !== undefined) {
        query += ' AND is_organic = ?';
        params.push(is_organic === 'true');
    }
    if (is_featured !== undefined) {
        query += ' AND is_featured = ?';
        params.push(is_featured === 'true');
    }
    if (min_price !== undefined) {
        query += ' AND price >= ?';
        params.push(parseFloat(min_price));
    }
    if (max_price !== undefined) {
        query += ' AND price <= ?';
        params.push(parseFloat(max_price));
    }
    if (search) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
    }

    // Apply sorting
    if (sort_by) {
        const validSortColumns = ['price', 'name', 'rating', 'created_at'];
        const validSortOrders = ['ASC', 'DESC'];
        
        if (validSortColumns.includes(sort_by)) {
            const order = validSortOrders.includes(sort_order?.toUpperCase()) 
                ? sort_order.toUpperCase() 
                : 'ASC';
            query += ` ORDER BY ${sort_by} ${order}`;
        }
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    // Execute query
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to fetch products' });
        }
        res.json(results);
    });
});

// Get single product by ID
app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to fetch product' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(results[0]);
    });
});

// Get products by category
app.get('/api/products/category/:category', (req, res) => {
    const { category } = req.params;
    
    db.query('SELECT * FROM products WHERE category = ?', [category], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to fetch products' });
        }
        res.json(results);
    });
});

// Get featured products
app.get('/api/products/featured', (req, res) => {
    db.query('SELECT * FROM products WHERE is_featured = true', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Failed to fetch featured products' });
        }
        res.json(results);
    });
});

// Update product stock
app.put('/api/products/:id/stock', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity === undefined) {
        return res.status(400).json({ message: 'Quantity is required' });
    }

    db.query(
        'UPDATE products SET stock_quantity = ? WHERE id = ?',
        [quantity, id],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Failed to update stock' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json({ message: 'Stock updated successfully' });
        }
    );
});

// Update product rating
app.put('/api/products/:id/rating', (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (rating === undefined || rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'Valid rating (0-5) is required' });
    }

    db.query(
        `UPDATE products 
         SET rating = ((rating * rating_count) + ?) / (rating_count + 1),
             rating_count = rating_count + 1
         WHERE id = ?`,
        [rating, id],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Failed to update rating' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json({ message: 'Rating updated successfully' });
        }
    );
});

// Search products
app.get('/api/products/search/:term', (req, res) => {
    const { term } = req.params;
    const searchTerm = `%${term}%`;
    
    // Log the search request
    console.log('Search request received for term:', term);

    // Query to search in name and description
    const query = `
        SELECT 
            id,
            name,
            description,
            price,
            category,
            image_url,
            unit,
            is_organic,
            rating
        FROM products 
        WHERE name LIKE ? 
        OR description LIKE ?
        OR category LIKE ?
        LIMIT 10
    `;
    
    db.query(
        query,
        [searchTerm, searchTerm, searchTerm],
        (err, results) => {
            if (err) {
                console.error('Search error:', err);
                return res.status(500).json({ 
                    message: 'Failed to search products',
                    error: err.message 
                });
            }
            
            // Log the results
            console.log(`Found ${results.length} results for search term: ${term}`);
            
            res.json(results);
        }
    );
});

// Get products with low stock (for admin)
app.get('/api/products/admin/low-stock', (req, res) => {
    const threshold = 20; // Define low stock threshold
    
    db.query(
        'SELECT * FROM products WHERE stock_quantity <= ?',
        [threshold],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Failed to fetch low stock products' });
            }
            res.json(results);
        }
    );
});

// Test endpoint to verify server is running
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Server is running correctly',
        timestamp: new Date().toISOString()
    });
});

// Serve static files and handle all non-API routes
app.use(express.static(path.join(__dirname, '../Frontend'), {
    index: 'Index.html' // Set Index.html as the default page
}));

// Handle all other routes by serving index.html
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/Index.html'));
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API endpoints available at http://localhost:${port}/api/`);
});
