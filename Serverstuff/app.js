const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const { Pool, Client } = require('pg');

const app = express();
const port = 3006;

// Configure PostgreSQL database connection
const pool = new Pool({
  user: 'casaos',
  host: '192.168.1.109',
  database: 'casaos',
  password: 'casaos',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
    return;
  }
  console.log('Connected to PostgreSQL database');
});

// Use the cors middleware with appropriate options
//app.use(cors({
//  origin: 'http://localhost:19006',
//  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//  credentials: true, // If you need to allow credentials (e.g., cookies)
//}));

app.use(cors({ origin: '*' })); //Absolutly Unsafe, use only for Dev Enviroment ;)

// Middleware for parsing JSON data
app.use(bodyParser.json());

// API endpoint for adding a product
app.post('/api/foodwastetracker/products', (req, res) => {
  const { name, expiry_date, user_id ,addtocommunity} = req.body;

  if (!name || !expiry_date || user_id == null) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  const insertProductQuery = 'INSERT INTO products (name, expiry_date, user_id, addtocommunity) VALUES ($1, $2, $3, $4)';
  pool.query(insertProductQuery, [name, expiry_date, user_id, addtocommunity], (err) => {
    if (err) {
      console.error('Error adding product:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    res.status(201).json({ message: 'Product added successfully' });
  });
});

// API endpoint for user login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Query the database to check if the user exists
  const checkUserQuery = 'SELECT id FROM users WHERE username = $1 AND password = $2'; // Select the user's ID
  pool.query(checkUserQuery, [username, password], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    if (results.rows.length === 1) {
      // User exists and credentials are correct
      const userId = results.rows[0].id; // Extract the user's ID
      res.status(200).json({ message: 'Login successful', userId }); // Include the user's ID in the response
    } else {
      // User not found or invalid credentials
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});

// API endpoint for user registration
app.post('/api/register', (req, res) => {
  const { username, password, firstname, lastname, email } = req.body;

  // Check if the username already exists in the database
  const checkUserQuery = 'SELECT * FROM users WHERE username = $1';
  pool.query(checkUserQuery, [username], (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    if (results.rows.length > 0) {
      // Username already exists
      res.status(400).json({ error: 'Username already taken' });
    } else {
      // Insert the new user into the database
      const insertUserQuery = 'INSERT INTO users (username, password, firstname, lastname, email) VALUES ($1, $2, $3, $4, $5)';
      pool.query(insertUserQuery, [username, password, firstname, lastname, email], (err) => {
        if (err) {
          console.error('Error registering user:', err);
          res.status(500).json({ error: 'An error occurred' });
          return;
        }
        res.status(201).json({ message: 'Registration successful' });
      });
    }
  });
});

// Add a new API endpoint for fetching user items
app.get('/api/user-items', async (req, res) => {
  const { userId } = req.query;

  // Check if userId is a valid integer
  if (!userId || isNaN(parseInt(userId))) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    // Query the database to fetch user items
    const fetchUserItemsQuery = 'SELECT * FROM products WHERE user_id = $1 ORDER BY expiry_date';
    const { rows } = await pool.query(fetchUserItemsQuery, [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Add a new API endpoint for fetching community items
app.get('/api/community-items', async (req, res) => {
  try {
    // Query the database to fetch community items
    const fetchCommunityItemsQuery = 'SELECT * FROM products WHERE "addtocommunity" = 1 ORDER BY expiry_date';
    const { rows } = await pool.query(fetchCommunityItemsQuery);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching community items:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Add a new API endpoint for offering an item to the community
app.post('/api/offer-to-community', async (req, res) => {
  const { itemId } = req.body;

  // Check if itemId is a valid integer
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return res.status(400).json({ error: 'Invalid itemId' });
  }
  // Update the item in the database
  const updateQuery = 'UPDATE products SET addtocommunity = 1 WHERE id = $1';

  try {
    const result = await pool.query(updateQuery, [itemId]);
    console.log('Item offered to the community successfully');
    res.status(200).json({ message: 'Item offered to the community successfully' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new API endpoint for Check if the user has residential data
app.get('/api/check-residential-data', async (req, res) => {
      const { userId } = req.query;
      console.log('Received userId:', userId);

      if (!userId) {
        return res.status(400).json({ error: 'Invalid input data' });
     }

  try {
     // Check if the user exists and has residential data in a single query
     const checkResidentialDataQuery = `
       SELECT EXISTS (
         SELECT 1 FROM residential_data WHERE user_id = $1
       ) AS has_residential_data
     `;
     const result = await pool.query(checkResidentialDataQuery, [userId]);
 
     if (result.rows[0].has_residential_data) {
       // User has residential data
       res.status(200).json({ hasResidentialData: true });
     } else {
       // User does not have residential data
       res.status(200).json({ hasResidentialData: false });
     }
  } catch (error) {
     console.error('Error checking residential data:', error);
     res.status(500).json({ error: 'An error occurred' });
  }
 });
 

// Add a new API endpoint for Insert residential data for the user
  app.post('/api/insert-residential-data', async (req, res) => {
    const { userId, postalCode, address, buildingNumber, phoneNumber } = req.body;
  
    if (userId == null || !postalCode || !address || !buildingNumber || !phoneNumber) {
      return res.status(400).json({ error: 'Invalid input data' });
    }
  
    try {
      const insertResidentialDataQuery = `INSERT INTO residential_data (user_id, postal_code, address, building_number, phone_number) VALUES ($1, $2, $3, $4, $5)`;
      
      await pool.query(insertResidentialDataQuery, [userId, postalCode, address, buildingNumber, phoneNumber]);
  
      res.status(201).json({ message: 'Residential data inserted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  });

  // Add a new API endpoint for deleting Items from the Storage
  app.delete('/api/remove-item/:itemId', async (req, res) => {
    const { itemId } = req.params;
  
    // Check if itemId is a valid integer
    if (!itemId || isNaN(parseInt(itemId))) {
      return res.status(400).json({ error: 'Invalid itemId' });
    }
  
    try {
      // Remove the item from the database
      const removeItemQuery = 'DELETE FROM products WHERE id = $1';
      await pool.query(removeItemQuery, [itemId]);
      
      // Respond with a success message
      res.status(200).json({ message: 'Item removed from storage' });
    } catch (error) {
      console.error('Error removing item from storage:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

  // Add a new API endpoint for retrieving User Informations
  app.get('/api/user-info/:userId', async (req, res) => {
    const { userId } = req.params;
  
    // Check if userId is a valid integer
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ success: false, error: 'Invalid userId' });
    }
  
    try {
      // Query the database to fetch user information based on userId
      const fetchUserInfoQuery = 'SELECT firstname, lastname FROM users WHERE id = $1';
      const { rows } = await pool.query(fetchUserInfoQuery, [userId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
  
      const user = rows[0];
      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Error fetching user information:', error);
      res.status(500).json({ success: false, error: 'An error occurred' });
    }
  });

  // Add a new API endpoint for changing Item to new User
  app.put('/api/update-item/:itemId', async (req, res) => {
    const { itemId } = req.params;
  
    // Check if itemId is a valid integer
    if (!itemId || isNaN(parseInt(itemId))) {
      return res.status(400).json({ success: false, error: 'Invalid itemId' });
    }
  
    try {
      // Update the item in the database based on itemId
      const updateItemQuery = 'UPDATE products SET addtocommunity = 0 WHERE id = $1';
      await pool.query(updateItemQuery, [itemId]);
  
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating the item:', error);
      res.status(500).json({ success: false, error: 'An error occurred' });
    }
  });
  
  
  app.post('/api/shopping-list', async (req, res) => {
    try {
      const { user_id, name, quantity } = req.body;
  
      if (!user_id || isNaN(user_id)) {
        return res.status(400).json({ error: 'Invalid user_id' });
      }
  
      const insertQuery = 'INSERT INTO shopping_list (user_id, name, quantity) VALUES ($1, $2, $3) RETURNING *';
      const values = [user_id, name, quantity];
  
      const { rows } = await pool.query(insertQuery, values);
  
      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating shopping list item:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
  app.get('/api/shopping-list/:user_id', async (req, res) => {
    try {
      const { user_id } = req.params;
  
      if (!user_id || isNaN(user_id)) {
        return res.status(400).json({ error: 'Invalid user_id' });
      }
  
      const selectQuery = 'SELECT * FROM shopping_list WHERE user_id = $1';
      const { rows } = await pool.query(selectQuery, [user_id]);
  
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error retrieving shopping list items:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
  app.put('/api/shopping-list/:item_id', async (req, res) => {
    try {
      const { item_id } = req.params;
      const { quantity } = req.body;
  
      if (!item_id || isNaN(item_id) || !quantity || isNaN(quantity)) {
        return res.status(400).json({ error: 'Invalid item_id or quantity' });
      }
  
      const updateQuery = 'UPDATE shopping_list SET quantity = $1 WHERE id = $2 RETURNING *';
      const values = [quantity, item_id];
  
      const { rows } = await pool.query(updateQuery, values);
  
      res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Error updating shopping list item:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
  app.delete('/api/shopping-list/:item_id', async (req, res) => {
    try {
      const { item_id } = req.params;
  
      if (!item_id || isNaN(item_id)) {
        return res.status(400).json({ error: 'Invalid item_id' });
      }
  
      const deleteQuery = 'DELETE FROM shopping_list WHERE id = $1 RETURNING *';
      const values = [item_id];
  
      const { rows } = await pool.query(deleteQuery, values);
  
      res.status(200).json(rows[0]);
    } catch (error) {
      console.error('Error deleting shopping list item:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
// Add a new API endpoint for fetching statistics
app.get('/api/statistics', async (req, res) => {
  try {
    // Query the database to fetch the total number of items
    const fetchTotalItemsQuery = 'SELECT COUNT(*) FROM products';
    const { rows: totalItems } = await pool.query(fetchTotalItemsQuery);

    // Query the database to fetch the number of items with the community
    const fetchCommunityItemsQuery = 'SELECT COUNT(*) FROM products WHERE "addtocommunity" = 1';
    const { rows: itemsWithCommunity } = await pool.query(fetchCommunityItemsQuery);

    res.status(200).json({
      totalItems: parseInt(totalItems[0].count),
      itemsWithCommunity: parseInt(itemsWithCommunity[0].count),
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});
// Add a new API endpoint to store Item in global_items
app.post('/api/global-items', async (req, res) => {
  const { name, expiry_date, user_id, addtocommunity } = req.body;

  try {
    const insertGlobalItemQuery = `
      INSERT INTO global_items (name, expiry_date, user_id, addtocommunity)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    const values = [name, expiry_date, user_id, addtocommunity];
    const { rows } = await pool.query(insertGlobalItemQuery, values);

    res.status(201).json({ id: rows[0].id, message: 'Item added to global_items table successfully' });
  } catch (error) {
    console.error('Error adding item to global_items table:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});
// Add a new API to update Item in global_items
app.post('/api/update-global-item', async (req, res) => {
  const { itemId, addtocommunity } = req.body;

  if (!itemId || addtocommunity === undefined) {
    return res.status(400).json({ error: 'Invalid request data' });
  }

  try {
    // Update the global_items table with the new addtocommunity value
    const updateGlobalItemQuery = 'UPDATE global_items SET addtocommunity = $1 WHERE id = $2';
    await pool.query(updateGlobalItemQuery, [addtocommunity, itemId]);

    res.status(200).json({ message: 'Item in global_items updated successfully.' });
  } catch (error) {
    console.error('Error updating global_items:', error);
    res.status(500).json({ error: 'An error occurred while updating global_items' });
  }
});
// Add a new API for fetching global_items
app.get('/api/global-items/statistics', async (req, res) => {
  try {
    // Query the database to fetch the total number of global items
    const fetchTotalGlobalItemsQuery = 'SELECT COUNT(*) FROM global_items';
    const { rows: totalGlobalItems } = await pool.query(fetchTotalGlobalItemsQuery);

    // Query the database to fetch the number of global items with the community
    const fetchGlobalItemsWithCommunityQuery = 'SELECT COUNT(*) FROM global_items WHERE addtocommunity = 1';
    const { rows: globalItemsWithCommunity } = await pool.query(fetchGlobalItemsWithCommunityQuery);

    res.status(200).json({
      totalGlobalItems: parseInt(totalGlobalItems[0].count),
      globalItemsWithCommunity: parseInt(globalItemsWithCommunity[0].count),
    });
  } catch (error) {
    console.error('Error fetching global items statistics:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// API endpoint for updating a product's notification ID
app.post('/api/update-product-notification', async (req, res) => {
  try {
    const { productId, notificationId } = req.body;

    if (!productId || !notificationId) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const updateNotificationQuery = 'UPDATE products SET notification_id = $1 WHERE id = $2';
    const { rowCount } = await pool.query(updateNotificationQuery, [notificationId, productId]);

    if (rowCount === 1) {
      res.status(200).json({ message: 'Notification added to the product successfully' });
    } else {
      res.status(404).json({ error: 'Product not found or notification not added' });
    }
  } catch (error) {
    console.error('Error updating product notification:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// API endpoint to check if notification_id is null for an item
app.get('/api/check-notification-id/:itemId', (req, res) => {
  const { itemId } = req.params;

  // Query the database to check if notification_id is null for the item
  const checkNotificationIdQuery = 'SELECT notification_id FROM products WHERE id = $1';
  pool.query(checkNotificationIdQuery, [itemId], (err, result) => {
    if (err) {
      console.error('Error checking notification ID:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }
    // Send whether notification_id is null or not as a response
    res.status(200).json({ isNull: result.rows[0].notification_id === null });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
