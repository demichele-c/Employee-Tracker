// Importing the 'inquirer' library for interactive command-line prompts
const inquirer = require('inquirer');

// Importing the client instance from the database configuration file
const client = require('../config/db');

// Defining an asynchronous function to view all employees
async function viewAllEmployees() {
  // Executing a SQL query to retrieve all records from the employee table
  const result = await client.query('SELECT * FROM employee');
  // Displaying the result in a table format
  console.table(result.rows);
}

// Defining an asynchronous function to add a new employee
async function addEmployee(first_name, last_name, role_id, manager_id) {
  // Executing a SQL query to insert a new employee with the specified details
  await client.query(
    'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)',
    [first_name, last_name, role_id, manager_id] // Parameters for the query
  );
  // Logging a confirmation message
  console.log(`Added ${first_name} ${last_name} to the database`);
}

// Defining an asynchronous function to update an employee's role
async function updateEmployeeRole(employee_id, role_id) {
  // Executing a SQL query to update the role_id for the specified employee
  await client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
  // Logging a confirmation message
  console.log('Updated employee\'s role');
}

// Defining an asynchronous function to update an employee's manager
async function updateEmployeeManager(employee_id, manager_id) {
  // Executing a SQL query to update the manager_id for the specified employee
  await client.query('UPDATE employee SET manager_id = $1 WHERE id = $2', [manager_id, employee_id]);
  // Logging a confirmation message
  console.log('Updated employee\'s manager');
}

// Defining an asynchronous function to delete an employee
async function deleteEmployee(employee_id) {
  // Executing a SQL query to delete the employee with the specified id
  await client.query('DELETE FROM employee WHERE id = $1', [employee_id]);
  // Logging a confirmation message
  console.log('Deleted employee from the database');
}

// Defining an asynchronous function to view employees by their manager
async function viewEmployeesByManager() {
  // Executing a SQL query to retrieve managers (employees without managers)
  const managers = await client.query('SELECT * FROM employee WHERE manager_id IS NULL');
  // Mapping the managers to choices for the prompt
  const managerChoices = managers.rows.map(manager => ({ name: `${manager.first_name} ${manager.last_name}`, value: manager.id }));

  // Prompting the user to select a manager
  const { manager_id } = await inquirer.prompt({
    type: 'list',
    name: 'manager_id',
    message: 'Select the manager:',
    choices: managerChoices
  });

  // Executing a SQL query to retrieve employees managed by the selected manager
  const result = await client.query(`
    SELECT e.id, e.first_name, e.last_name, m.first_name AS manager_first_name, m.last_name AS manager_last_name
    FROM employee e
    LEFT JOIN employee m ON e.manager_id = m.id
    WHERE e.manager_id = $1
  `, [manager_id]);

  // Displaying the result in a table format
  console.table(result.rows);
}

// Defining an asynchronous function to view employees by their department
async function viewEmployeesByDepartment() {
  // Executing a SQL query to retrieve all departments
  const departments = await client.query('SELECT * FROM department');
  // Mapping the departments to choices for the prompt
  const departmentChoices = departments.rows.map(department => ({ name: department.name, value: department.id }));

  // Prompting the user to select a department
  const { department_id } = await inquirer.prompt({
    type: 'list',
    name: 'department_id',
    message: 'Select the department:',
    choices: departmentChoices
  });

  // Executing a SQL query to retrieve employees in the selected department
  const result = await client.query(`
    SELECT e.id, e.first_name, e.last_name, d.name AS department_name
    FROM employee e
    JOIN role r ON e.role_id = r.id
    JOIN department d ON r.department_id = d.id
    WHERE d.id = $1
  `, [department_id]);

  // Displaying the result in a table format
  console.table(result.rows);
}

// Exporting the functions for use in other parts of the application
module.exports = {
  viewAllEmployees,
  addEmployee,
  updateEmployeeRole,
  updateEmployeeManager,
  deleteEmployee,
  viewEmployeesByManager,
  viewEmployeesByDepartment
};
