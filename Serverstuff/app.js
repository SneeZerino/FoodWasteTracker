const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 3006;

// Configure MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'foodwastetracker',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Middleware for parsing JSON data
app.use(bodyParser.json());

// API endpoint for user registration
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  // Check if the username already exists in the database
  const checkUserQuery = 'SELECT * FROM users WHERE username = ?';
  db.query(checkUserQuery, [username], (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      res.status(500).json({ error: 'An error occurred' });
      return;
    }

    if (results.length > 0) {
      // Username already exists
      res.status(400).json({ error: 'Username already taken' });
    } else {
      // Insert the new user into the database
      const insertUserQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.query(insertUserQuery, [username, password], (err) => {
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
