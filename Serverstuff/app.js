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
  const { username, password } = req.body;

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
      const insertUserQuery = 'INSERT INTO users (username, password) VALUES ($1, $2)';
      pool.query(insertUserQuery, [username, password], (err) => {
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
    const fetchUserItemsQuery = 'SELECT * FROM products WHERE user_id = $1';
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
    const fetchCommunityItemsQuery = 'SELECT * FROM products WHERE "addtocommunity" = 1';
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
      console.error('Error inserting residential data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
