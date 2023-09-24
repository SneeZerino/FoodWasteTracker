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

// Middleware for parsing JSON data
app.use(bodyParser.json());

// API endpoint for adding a product
app.post('/api/foodwastetracker/products', (req, res) => {
  const { name, expiry_date, user_id } = req.body;

  const insertProductQuery = 'INSERT INTO products (name, expiry_date, user_id) VALUES ($1, $2, $3)';
  pool.query(insertProductQuery, [name, expiry_date, user_id], (err) => {
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
