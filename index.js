const inquirer = require('inquirer');
const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    password: 'admin',
    host: 'localhost',
    database: 'employee_db'
});

client.connect();

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
            viewAllDepartments();
            break;
        case 'View All Roles':
            viewAllRoles();
            break;
        case 'View All Employees':
            viewAllEmployees();
            break;
        case 'Add Department':
            addDepartment();
            break;
        case 'Add Role':
            addRole();
            break;
        case 'Add Employee':
            addEmployee();
            break;
        case 'Update Employee Role':
            updateEmployeeRole();
            break;
        default:
            client.end();
            process.exit();
    }
}

async function viewAllDepartments() {
    const res = await client.query('SELECT * FROM department');
    console.table(res.rows);
    mainMenu();
}

async function viewAllRoles() {
    const res = await client.query('SELECT * FROM role');
    console.table(res.rows);
    mainMenu();
}

async function viewAllEmployees() {
    const res = await client.query('SELECT * FROM employee');
    console.table(res.rows);
    mainMenu();
}

async function addDepartment() {
    const { name } = await inquirer.prompt({
        type: 'input',
        name: 'name',
        message: 'Enter the name of the department:'
    });
    await client.query('INSERT INTO department (name) VALUES ($1)', [name]);
    console.log(`Added ${name} to the database`);
    mainMenu();
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
    mainMenu();
}

async function addEmployee() {
    const roles = await client.query('SELECT * FROM role');
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
    mainMenu();
}

async function updateEmployeeRole() {
    const employees = await client.query('SELECT * FROM employee');
    const employeeChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));

    const roles = await client.query('SELECT * FROM role');
    const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));

    const { employee_id, role_id } = await inquirer.prompt([
        { type: 'list', name: 'employee_id', message: 'Select the employee to update:', choices: employeeChoices },
        { type: 'list', name: 'role_id', message: 'Select the new role:', choices: roleChoices }
    ]);

    await client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
    console.log(`Updated employee's role`);
    mainMenu();
}

mainMenu();
