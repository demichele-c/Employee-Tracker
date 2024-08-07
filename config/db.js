// Importing the 'pg' library's Client class for connecting to PostgreSQL
const { Client } = require('pg');

// Importing and configuring environment variables from a .env file
require('dotenv').config();

// Creating a new PostgreSQL client instance with the connection details
// sourced from environment variables
const client = new Client({
  user: process.env.DB_USER,         // Database user
  password: process.env.DB_PASSWORD, // Database user's password
  host: process.env.DB_HOST,         // Database host
  database: process.env.DB_NAME      // Database name
});

// Establishing a connection to the PostgreSQL database
client.connect()
  .then(() => console.log("Connected to the database.")) // On successful connection
  .catch(err => console.error('Connection error', err.stack)); // On connection error

// Exporting the client instance for use in other parts of the application
module.exports = client;
