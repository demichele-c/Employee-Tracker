nst inquirer = require('inquirer'); // Import inquirer for command-line prompts
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
    console.log("Connected to the database.");
    return mainMenu(); // Ensure mainMenu is called after successful connection
  })
  .catch(err => console.error('Connection error', err.stack)); // Log any connection errors

// Main menu function to handle user choices
async function mainMenu() {
  const { choice } = await inquirer.prompt({
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
    choices: [
      'View All Departments',
      'View All Roles',
      'View All Employees',
      'Add Department',
      'Add Role',
      'Add Employee',
      'Update Employee Role',
      'Exit'
    ]
  });

  switch (choice) {
    case 'View All Departments':
      await viewAllDepartments(); // Call function to view departments
      break;
    case 'View All Roles':
      await viewAllRoles(); // Call function to view roles
      break;
    case 'View All Employees':
      await viewAllEmployees(); // Call function to view employees
      break;
    case 'Add Department':
      await addDepartment(); // Call function to add a department
      break;
    case 'Add Role':
      await addRole(); // Call function to add a role
      break;
    case 'Add Employee':
      await addEmployee(); // Call function to add an employee
      break;
    case 'Update Employee Role':
      await updateEmployeeRole(); // Call function to update employee role
      break;
    case 'Exit':
      await client.end(); // Close the database connection
      process.exit(); // Exit the application
  }
}

// Function to view all departments
async function viewAllDepartments() {
  const res = await client.query('SELECT * FROM department'); // Query all departments
  console.table(res.rows); // Display departments in a table format
  await mainMenu(); // Return to the main menu
}

// Function to view all roles
async function viewAllRoles() {
  const res = await client.query('SELECT * FROM role'); // Query all roles
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

// Function to update an employee's role and manager
async function updateEmployeeRole() {
  const employees = await client.query('SELECT * FROM employee'); // Get all employees
  const employeeChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id })); // Format for choices

  const roles = await client.query('SELECT * FROM role'); // Get all roles
  const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id })); // Format for choices

  const managerChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
  managerChoices.push({ name: 'None', value: null }); // Add option for no manager

  const { employee_id, role_id, manager_id } = await inquirer.prompt([
    { type: 'list', name: 'employee_id', message: 'Select the employee to update:', choices: employeeChoices },
    { type: 'list', name: 'role_id', message: 'Select the new role:', choices: roleChoices },
    { type: 'list', name: 'manager_id', message: 'Select the new manager:', choices: managerChoices }
  ]); // Prompt user for employee, role, and manager details

  await client.query('UPDATE employee SET role_id = $1, manager_id = $2 WHERE id = $3', [role_id, manager_id, employee_id]); // Update employee's role and manager in the database
  console.log(`Updated employee's role and manager`); // Confirm update
  await mainMenu(); // Return to the main menu
}