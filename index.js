const inquirer = require('inquirer'); // Import inquirer for command-line prompts
const { Client } = require('pg'); // Import the PostgreSQL client

// Create a new PostgreSQL client instance with connection details
const client = new Client({
  user: 'postgres',
  password: 'admin',
  host: 'localhost',
  database: 'employee_db'
});

// Connect to the database and call mainMenu if successful
client.connect()
  .then(() => {
    console.log("Connected to the database."); // Log connection success
    return mainMenu(); // Call the main menu function after successful connection
  })
  .catch(err => console.error('Connection error', err.stack)); // Log any connection errors

// Main menu function to handle user choices
async function mainMenu() {
  // Prompt user to select an option from the menu
  const { choice } = await inquirer.prompt({
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
    choices: [
      'View All Departments',        // Option to view all departments
      'View All Roles',              // Option to view all roles
      'View All Employees',          // Option to view all employees
      'Add Department',              // Option to add a new department
      'Add Role',                    // Option to add a new role
      'Add Employee',                // Option to add a new employee
      'Update Employee Role',        // Option to update an employee's role
      'Update Employee Manager',     // Option to update an employee's manager
      'View Employees by Manager',   // Option to view employees by manager
      'View Employees by Department',// Option to view employees by department
      'Delete Department',           // Option to delete a department
      'Delete Role',                 // Option to delete a role
      'Delete Employee',             // Option to delete an employee
      'View Total Utilized Budget',  // Option to view the total utilized budget of a department
      'Exit'                         // Option to exit the application
    ]
  });

  // Handle the user choice by calling the appropriate function
  switch (choice) {
    case 'View All Departments':
      await viewAllDepartments(); // View all departments
      break;
    case 'View All Roles':
      await viewAllRoles(); // View all roles
      break;
    case 'View All Employees':
      await viewAllEmployees(); // View all employees
      break;
    case 'Add Department':
      await addDepartment(); // Add a new department
      break;
    case 'Add Role':
      await addRole(); // Add a new role
      break;
    case 'Add Employee':
      await addEmployee(); // Add a new employee
      break;
    case 'Update Employee Role':
      await updateEmployeeRole(); // Update an employee's role
      break;
    case 'Update Employee Manager':
      await updateEmployeeManager(); // Update an employee's manager
      break;
    case 'View Employees by Manager':
      await viewEmployeesByManager(); // View employees by manager
      break;
    case 'View Employees by Department':
      await viewEmployeesByDepartment(); // View employees by department
      break;
    case 'Delete Department':
      await deleteDepartment(); // Delete a department
      break;
    case 'Delete Role':
      await deleteRole(); // Delete a role
      break;
    case 'Delete Employee':
      await deleteEmployee(); // Delete an employee
      break;
    case 'View Total Utilized Budget':
      await viewTotalUtilizedBudget(); // View the total utilized budget of a department
      break;
    case 'Exit':
      await client.end(); // Close the database connection
      process.exit(); // Exit the application
  }
}

// Function to view all departments
async function viewAllDepartments() {
  const res = await client.query('SELECT * FROM department'); // Query all departments from the database
  console.table(res.rows); // Display departments in a table format
  await mainMenu(); // Return to the main menu
}

// Function to view all roles
async function viewAllRoles() {
  const res = await client.query('SELECT * FROM role'); // Query all roles from the database
  console.table(res.rows); // Display roles in a table format
  await mainMenu(); // Return to the main menu
}

// Function to view all employees
async function viewAllEmployees() {
  const res = await client.query(`
    SELECT 
      e.id, 
      e.first_name, 
      e.last_name, 
      r.title AS role, 
      d.name AS department, 
      r.salary, 
      m.first_name || ' ' || m.last_name AS manager
    FROM 
      employee e
      LEFT JOIN role r ON e.role_id = r.id
      LEFT JOIN department d ON r.department_id = d.id
      LEFT JOIN employee m ON e.manager_id = m.id
  `); // Query to join employee, role, department, and manager tables
  console.table(res.rows); // Display employees in a table format
  await mainMenu(); // Return to the main menu
}

// Function to add a new department
async function addDepartment() {
  const { name } = await inquirer.prompt({
    type: 'input',
    name: 'name',
    message: 'Enter the name of the department:'
  }); // Prompt user for department name
  await client.query('INSERT INTO department (name) VALUES ($1)', [name]); // Insert new department into database
  console.log(`Added ${name} to the database`); // Confirm addition
  await mainMenu(); // Return to the main menu
}

// Function to add a new role
async function addRole() {
  const departments = await client.query('SELECT * FROM department'); // Get all departments
  const departmentChoices = departments.rows.map(dept => ({ name: dept.name, value: dept.id })); // Format for choices

  const { title, salary, department_id } = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Enter the role title:' },
    { type: 'input', name: 'salary', message: 'Enter the role salary:' },
    { type: 'list', name: 'department_id', message: 'Select the department:', choices: departmentChoices }
  ]); // Prompt user for role details

  await client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]); // Insert new role into database
  console.log(`Added ${title} to the database`); // Confirm addition
  await mainMenu(); // Return to the main menu
}

// Function to add a new employee
async function addEmployee() {
  try {
    const roles = await client.query('SELECT * FROM role'); // Get all roles
    if (roles.rows.length === 0) {
      console.log('No roles available. Please add roles first.'); // Notify if no roles are available
      await mainMenu(); // Return to the main menu
      return;
    }

    const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id })); // Format for choices

    const employees = await client.query('SELECT * FROM employee'); // Get all employees
    const managerChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
    managerChoices.push({ name: 'None', value: null }); // Add option for no manager

    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
      { type: 'input', name: 'first_name', message: 'Enter the first name:' },
      { type: 'input', name: 'last_name', message: 'Enter the last name:' },
      { type: 'list', name: 'role_id', message: 'Select the role:', choices: roleChoices },
      { type: 'list', name: 'manager_id', message: 'Select the manager:', choices: managerChoices }
    ]); // Prompt user for employee details

    await client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id]); // Insert new employee into database
    console.log(`Added ${first_name} ${last_name} to the database`); // Confirm addition
  } catch (error) {
    console.error('Error adding employee:', error); // Handle and log errors
  }

  await mainMenu(); // Return to the main menu
}

// Function to update an employee's role
async function updateEmployeeRole() {
  const employees = await client.query('SELECT * FROM employee'); // Get all employees
  const employeeChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })); // Format for choices

  const roles = await client.query('SELECT * FROM role'); // Get all roles
  const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id })); // Format for choices

  const { employee_id, role_id } = await inquirer.prompt([
    { type: 'list', name: 'employee_id', message: 'Select the employee to update:', choices: employeeChoices },
    { type: 'list', name: 'role_id', message: 'Select the new role:', choices: roleChoices }
  ]); // Prompt user for employee and role details

  await client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]); // Update employee's role in database
  console.log('Updated employee role'); // Confirm update
  await mainMenu(); // Return to the main menu
}

// Function to update an employee's manager
async function updateEmployeeManager() {
  const employees = await client.query('SELECT * FROM employee'); // Get all employees
  const employeeChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })); // Format for choices

  const { employee_id, manager_id } = await inquirer.prompt([
    { type: 'list', name: 'employee_id', message: 'Select the employee to update:', choices: employeeChoices },
    { type: 'list', name: 'manager_id', message: 'Select the new manager:', choices: [...employeeChoices, { name: 'None', value: null }] }
  ]); // Prompt user for employee and manager details

  await client.query('UPDATE employee SET manager_id = $1 WHERE id = $2', [manager_id, employee_id]); // Update employee's manager in database
  console.log('Updated employee manager'); // Confirm update
  await mainMenu(); // Return to the main menu
}

// Function to view employees by manager
async function viewEmployeesByManager() {
  const managers = await client.query(`
    SELECT 
      DISTINCT m.id, 
      m.first_name || ' ' || m.last_name AS manager
    FROM 
      employee e
      JOIN employee m ON e.manager_id = m.id
  `); // Query to get distinct managers

  const managerChoices = managers.rows.map(manager => ({ name: manager.manager, value: manager.id })); // Format for choices

  const { manager_id } = await inquirer.prompt({
    type: 'list',
    name: 'manager_id',
    message: 'Select the manager:',
    choices: managerChoices
  }); // Prompt user to select a manager

  const res = await client.query(`
    SELECT 
      e.id, 
      e.first_name, 
      e.last_name, 
      r.title AS role, 
      d.name AS department, 
      r.salary
    FROM 
      employee e
      JOIN role r ON e.role_id = r.id
      JOIN department d ON r.department_id = d.id
    WHERE 
      e.manager_id = $1
  `, [manager_id]); // Query to get employees by manager

  console.table(res.rows); // Display employees in a table format
  await mainMenu(); // Return to the main menu
}

// Function to view employees by department
async function viewEmployeesByDepartment() {
  const departments = await client.query('SELECT * FROM department'); // Get all departments
  const departmentChoices = departments.rows.map(dept => ({ name: dept.name, value: dept.id })); // Format for choices

  const { department_id } = await inquirer.prompt({
    type: 'list',
    name: 'department_id',
    message: 'Select the department:',
    choices: departmentChoices
  }); // Prompt user to select a department

  const res = await client.query(`
    SELECT 
      e.id, 
      e.first_name, 
      e.last_name, 
      r.title AS role, 
      r.salary, 
      d.name AS department,
      m.first_name || ' ' || m.last_name AS manager
    FROM 
      employee e
      JOIN role r ON e.role_id = r.id
      JOIN department d ON r.department_id = d.id
      LEFT JOIN employee m ON e.manager_id = m.id
    WHERE 
      d.id = $1
  `, [department_id]); // Query to get employees by department

  console.table(res.rows); // Display employees in a table format
  await mainMenu(); // Return to the main menu
}

// Function to delete a department
async function deleteDepartment() {
  const departments = await client.query('SELECT * FROM department'); // Get all departments
  const departmentChoices = departments.rows.map(dept => ({ name: dept.name, value: dept.id })); // Format for choices

  const { department_id } = await inquirer.prompt({
    type: 'list',
    name: 'department_id',
    message: 'Select the department to delete:',
    choices: departmentChoices
  }); // Prompt user to select a department to delete

  const roles = await client.query('SELECT * FROM role WHERE department_id = $1', [department_id]); // Get roles associated with the department

  if (roles.rows.length > 0) {
    console.log('Please delete or update roles associated with this department first.'); // Notify if roles are associated with the department
    await mainMenu(); // Return to the main menu
    return;
  }

  await client.query('DELETE FROM department WHERE id = $1', [department_id]); // Delete the department from database
  console.log('Deleted department'); // Confirm deletion
  await mainMenu(); // Return to the main menu
}

// Function to delete a role
async function deleteRole() {
  const roles = await client.query('SELECT * FROM role'); // Get all roles
  const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id })); // Format for choices

  const { role_id } = await inquirer.prompt({
    type: 'list',
    name: 'role_id',
    message: 'Select the role to delete:',
    choices: roleChoices
  }); // Prompt user to select a role to delete

  const employees = await client.query('SELECT * FROM employee WHERE role_id = $1', [role_id]); // Get employees associated with the role

  if (employees.rows.length > 0) {
    console.log('Please update or remove employees associated with this role first.'); // Notify if employees are associated with the role
    await mainMenu(); // Return to the main menu
    return;
  }

  await client.query('DELETE FROM role WHERE id = $1', [role_id]); // Delete the role from database
  console.log('Deleted role'); // Confirm deletion
  await mainMenu(); // Return to the main menu
}

// Function to delete an employee
async function deleteEmployee() {
  const employees = await client.query('SELECT * FROM employee'); // Get all employees
  const employeeChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })); // Format for choices

  const { employee_id } = await inquirer.prompt({
    type: 'list',
    name: 'employee_id',
    message: 'Select the employee to delete:',
    choices: employeeChoices
  }); // Prompt user to select an employee to delete

  await client.query('UPDATE employee SET manager_id = NULL WHERE manager_id = $1', [employee_id]); // Update employees who have the selected employee as their manager, setting manager_id to NULL

  await client.query('DELETE FROM employee WHERE id = $1', [employee_id]); // Delete the selected employee from the database
  console.log('Deleted employee'); // Confirm deletion

  await mainMenu(); // Return to the main menu
}

// Function to view the total utilized budget of a department
async function viewTotalUtilizedBudget() {
  const departments = await client.query('SELECT * FROM department'); // Get all departments
  const departmentChoices = departments.rows.map(dept => ({ name: dept.name, value: dept.id })); // Format for choices

  const { department_id } = await inquirer.prompt({
    type: 'list',
    name: 'department_id',
    message: 'Select the department:',
    choices: departmentChoices
  }); // Prompt user to select a department

  const res = await client.query(`
    SELECT 
      d.name AS department,
      SUM(r.salary) AS utilized_budget
    FROM 
      employee e
      JOIN role r ON e.role_id = r.id
      JOIN department d ON r.department_id = d.id
    WHERE 
      d.id = $1
    GROUP BY 
      d.name
  `, [department_id]); // Query to calculate total utilized budget for the department

  console.table(res.rows); // Display the total utilized budget in a table format
  await mainMenu(); // Return to the main menu
}
