// Importing the client instance from the database configuration file
const client = require('../config/db');

// Defining an asynchronous function to view all roles
async function viewAllRoles() {
  // Executing a SQL query to retrieve all records from the role table
  const res = await client.query('SELECT * FROM role');
  // Displaying the result in a table format
  console.table(res.rows);
}

// Defining an asynchronous function to add a new role
async function addRole(title, salary, department_id) {
  // Executing a SQL query to insert a new role with the specified details
  await client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
  // Logging a confirmation message
  console.log(`Added ${title} to the database`);
}

// Defining an asynchronous function to delete a role
async function deleteRole(role_id) {
  // Executing a SQL query to retrieve employees associated with the role
  const employees = await client.query('SELECT * FROM employee WHERE role_id = $1', [role_id]);
  // Checking if there are employees associated with the role
  if (employees.rows.length > 0) {
    // Logging a message to prompt the user to update or remove employees first
    console.log('Please update or remove employees associated with this role first.');
    return false; // Indicating that the role could not be deleted
  }
  // Executing a SQL query to delete the role
  await client.query('DELETE FROM role WHERE id = $1', [role_id]);
  // Logging a confirmation message
  console.log('Deleted role');
  return true; // Indicating successful deletion
}

// Exporting the functions for use in other parts of the application
module.exports = { viewAllRoles, addRole, deleteRole };
