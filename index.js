const inquirer = require('inquirer');
const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'admin',
  host: 'localhost',
  database: 'employee_db'
});

client.connect()
  .then(() => {
    console.log("Connected to the database.");
    return mainMenu(); // Ensure mainMenu is called after successful connection
  })
  .catch(err => console.error('Connection error', err.stack));

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
      await viewAllDepartments();
      break;
    case 'View All Roles':
      await viewAllRoles();
      break;
    case 'View All Employees':
      await viewAllEmployees();
      break;
    case 'Add Department':
      await addDepartment();
      break;
    case 'Add Role':
      await addRole();
      break;
    case 'Add Employee':
      await addEmployee();
      break;
    case 'Update Employee Role':
      await updateEmployeeRole();
      break;
    case 'Exit':
      await client.end();
      process.exit();
  }
}

async function viewAllDepartments() {
  const res = await client.query('SELECT * FROM department');
  console.table(res.rows);
  await mainMenu(); // Ensure this call is awaited
}

async function viewAllRoles() {
  const res = await client.query('SELECT * FROM role');
  console.table(res.rows);
  await mainMenu(); // Ensure this call is awaited
}

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
  `);
  console.table(res.rows);
  await mainMenu(); // Ensure this call is awaited
}

async function addDepartment() {
  const { name } = await inquirer.prompt({
    type: 'input',
    name: 'name',
    message: 'Enter the name of the department:'
  });
  await client.query('INSERT INTO department (name) VALUES ($1)', [name]);
  console.log(`Added ${name} to the database`);
  await mainMenu(); // Ensure this call is awaited
}

async function addRole() {
  const departments = await client.query('SELECT * FROM department');
  const departmentChoices = departments.rows.map(dept => ({ name: dept.name, value: dept.id }));

  const { title, salary, department_id } = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Enter the role title:' },
    { type: 'input', name: 'salary', message: 'Enter the role salary:' },
    { type: 'list', name: 'department_id', message: 'Select the department:', choices: departmentChoices }
  ]);

  await client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
  console.log(`Added ${title} to the database`);
  await mainMenu(); // Ensure this call is awaited
}

async function addEmployee() {
  try {
    const roles = await client.query('SELECT * FROM role');
    if (roles.rows.length === 0) {
      console.log('No roles available. Please add roles first.');
      await mainMenu();
      return;
    }

    const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));

    const employees = await client.query('SELECT * FROM employee');
    const managerChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
    managerChoices.push({ name: 'None', value: null });

    const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
      { type: 'input', name: 'first_name', message: 'Enter the first name:' },
      { type: 'input', name: 'last_name', message: 'Enter the last name:' },
      { type: 'list', name: 'role_id', message: 'Select the role:', choices: roleChoices },
      { type: 'list', name: 'manager_id', message: 'Select the manager:', choices: managerChoices }
    ]);

    await client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [first_name, last_name, role_id, manager_id]);
    console.log(`Added ${first_name} ${last_name} to the database`);
  } catch (error) {
    console.error('Error adding employee:', error);
  }

  await mainMenu();
}

async function updateEmployeeRole() {
  const employees = await client.query('SELECT * FROM employee');
  const employeeChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));

  const roles = await client.query('SELECT * FROM role');
  const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));

  const managerChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
  managerChoices.push({ name: 'None', value: null });

  const { employee_id, role_id, manager_id } = await inquirer.prompt([
    { type: 'list', name: 'employee_id', message: 'Select the employee to update:', choices: employeeChoices },
    { type: 'list', name: 'role_id', message: 'Select the new role:', choices: roleChoices },
    { type: 'list', name: 'manager_id', message: 'Select the new manager:', choices: managerChoices }
  ]);

  await client.query('UPDATE employee SET role_id = $1, manager_id = $2 WHERE id = $3', [role_id, manager_id, employee_id]);
  console.log(`Updated employee's role and manager`);
  await mainMenu(); // Ensure this call is awaited
}
