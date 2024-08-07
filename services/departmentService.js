// Importing the client instance from the database configuration file
const client = require('../config/db');

// Defining an asynchronous function to view all departments
async function viewAllDepartments() {
  // Executing a SQL query to retrieve all records from the department table
  const res = await client.query('SELECT * FROM department');
  // Displaying the result in a table format
  console.table(res.rows);
}

// Defining an asynchronous function to add a new department
async function addDepartment(name) {
  // Executing a SQL query to insert a new department with the specified name
  await client.query('INSERT INTO department (name) VALUES ($1)', [name]); // $1 is a placeholder for the name parameter
  // Logging a confirmation message
  console.log(`Added ${name} to the database`);
}

// Defining an asynchronous function to delete a department
async function deleteDepartment(department_id) {
  // Executing a SQL query to retrieve all roles associated with the specified department
  const roles = await client.query('SELECT * FROM role WHERE department_id = $1', [department_id]); // $1 is a placeholder for the department_id parameter
  // Checking if there are any roles associated with the department
  if (roles.rows.length > 0) {
    // If there are roles associated with the department, log a message and return false
    console.log('Please delete or update roles associated with this department first.');
    return false;
  }
  // Executing a SQL query to delete the department with the specified id
  await client.query('DELETE FROM department WHERE id = $1', [department_id]); // $1 is a placeholder for the department_id parameter
  // Logging a confirmation message
  console.log('Deleted department');
  return true;
}

// Exporting the functions for use in other parts of the application
module.exports = { viewAllDepartments, addDepartment, deleteDepartment };
