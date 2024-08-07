// Importing the 'inquirer' library for command-line prompts
const inquirer = require('inquirer');

// Importing the main menu prompt function from the prompts module
const { mainMenu } = require('./prompts/inquirerPrompts');

// Importing service functions for departments
const { viewAllDepartments, addDepartment, deleteDepartment } = require('./services/departmentService');

// Importing service functions for roles
const { viewAllRoles, addRole, deleteRole } = require('./services/roleService');

// Importing service functions for employees
const {
  viewAllEmployees,
  addEmployee,
  updateEmployeeRole,
  updateEmployeeManager,
  deleteEmployee,
  viewEmployeesByManager,
  viewEmployeesByDepartment
} = require('./services/employeeService');

// Importing the function to view the budget for a department
const { viewBudgetForDepartment } = require('./services/budgetService');

// Importing the database client instance
const client = require('./config/db');

// Defining the main function to handle user interactions
async function main() {
  let exit = false; // Flag to control the exit of the loop
  while (!exit) {
    // Prompting the user with the main menu and capturing their choice
    const choice = await mainMenu();

    // Handling the user's choice using a switch statement
    switch (choice) {
      case 'View All Departments':
        await viewAllDepartments(); // Display all departments
        break;
      case 'View All Roles':
        await viewAllRoles(); // Display all roles
        break;
      case 'View All Employees':
        await viewAllEmployees(); // Display all employees
        break;
      case 'View Employees by Manager':
        await viewEmployeesByManager(); // Display employees by manager
        break;
      case 'View Employees by Department':
        await viewEmployeesByDepartment(); // Display employees by department
        break;
      case 'View Budget for Department': // Updated case for viewing budget
        // Querying all departments to provide choices for budget viewing
        const departments = await client.query('SELECT * FROM department');
        const departmentChoices = departments.rows.map(dept => ({ name: dept.name, value: dept.id }));

        // Prompting the user to select a department
        const { department_id: selectedDepartmentId } = await inquirer.prompt({
          type: 'list',
          name: 'department_id',
          message: 'Select the department:',
          choices: departmentChoices
        });

        // Displaying the budget for the selected department
        await viewBudgetForDepartment(selectedDepartmentId);
        break;
      case 'Add Department':
        // Prompting the user to enter the name of the new department
        const { name: departmentName } = await inquirer.prompt({
          type: 'input',
          name: 'name',
          message: 'Enter the name of the department:'
        });
        await addDepartment(departmentName); // Adding the new department
        break;
      case 'Add Role':
        // Querying all departments for role assignment choices
        const departmentsForRole = await client.query('SELECT * FROM department');
        const departmentChoicesForRole = departmentsForRole.rows.map(dept => ({ name: dept.name, value: dept.id }));

        // Prompting the user to enter details for the new role
        const { title, salary, department_id: departmentIdForRole } = await inquirer.prompt([
          { type: 'input', name: 'title', message: 'Enter the role title:' },
          { type: 'input', name: 'salary', message: 'Enter the role salary:' },
          { type: 'list', name: 'department_id', message: 'Select the department:', choices: departmentChoicesForRole }
        ]);
        await addRole(title, salary, departmentIdForRole); // Adding the new role
        break;
      case 'Add Employee':
        // Querying all roles and employees for assignment and manager choices
        const roles = await client.query('SELECT * FROM role');
        const roleChoices = roles.rows.map(role => ({ name: role.title, value: role.id }));

        const employees = await client.query('SELECT * FROM employee');
        const managerChoices = employees.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
        managerChoices.push({ name: 'None', value: null });

        // Prompting the user to enter details for the new employee
        const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
          { type: 'input', name: 'first_name', message: 'Enter the first name:' },
          { type: 'input', name: 'last_name', message: 'Enter the last name:' },
          { type: 'list', name: 'role_id', message: 'Select the role:', choices: roleChoices },
          { type: 'list', name: 'manager_id', message: 'Select the manager:', choices: managerChoices }
        ]);
        await addEmployee(first_name, last_name, role_id, manager_id); // Adding the new employee
        break;
      case 'Update Employee Role':
        // Querying all employees and roles for update choices
        const employeesForRoleUpdate = await client.query('SELECT * FROM employee');
        const employeeChoicesForRoleUpdate = employeesForRoleUpdate.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));

        const rolesForUpdate = await client.query('SELECT * FROM role');
        const roleChoicesForUpdate = rolesForUpdate.rows.map(role => ({ name: role.title, value: role.id }));

        // Prompting the user to select an employee and the new role
        const { employee_id: employeeIdForRole, role_id: newRoleId } = await inquirer.prompt([
          { type: 'list', name: 'employee_id', message: 'Select the employee:', choices: employeeChoicesForRoleUpdate },
          { type: 'list', name: 'role_id', message: 'Select the new role:', choices: roleChoicesForUpdate }
        ]);
        await updateEmployeeRole(employeeIdForRole, newRoleId); // Updating the employee's role
        break;
      case 'Update Employee Manager':
        // Querying all employees for manager choices
        const employeesForManagerUpdate = await client.query('SELECT * FROM employee');
        const employeeChoicesForManagerUpdate = employeesForManagerUpdate.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));

        const managersForUpdate = await client.query('SELECT * FROM employee');
        const managerChoicesForUpdate = managersForUpdate.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));
        managerChoicesForUpdate.push({ name: 'None', value: null });

        // Prompting the user to select an employee and the new manager
        const { employee_id: employeeIdForManager, manager_id: newManagerId } = await inquirer.prompt([
          { type: 'list', name: 'employee_id', message: 'Select the employee:', choices: employeeChoicesForManagerUpdate },
          { type: 'list', name: 'manager_id', message: 'Select the new manager:', choices: managerChoicesForUpdate }
        ]);
        await updateEmployeeManager(employeeIdForManager, newManagerId); // Updating the employee's manager
        break;
      case 'Delete Department':
        // Querying all departments for deletion choices
        const departmentsForDelete = await client.query('SELECT * FROM department');
        const departmentChoicesForDelete = departmentsForDelete.rows.map(dept => ({ name: dept.name, value: dept.id }));

        // Prompting the user to select the department to delete
        const { department_id: departmentIdForDelete } = await inquirer.prompt([
          { type: 'list', name: 'department_id', message: 'Select the department to delete:', choices: departmentChoicesForDelete }
        ]);
        await deleteDepartment(departmentIdForDelete); // Deleting the selected department
        break;
      case 'Delete Role':
        // Querying all roles for deletion choices
        const rolesForDelete = await client.query('SELECT * FROM role');
        const roleChoicesForDelete = rolesForDelete.rows.map(role => ({ name: role.title, value: role.id }));

        // Prompting the user to select the role to delete
        const { role_id: roleIdForDelete } = await inquirer.prompt([
          { type: 'list', name: 'role_id', message: 'Select the role to delete:', choices: roleChoicesForDelete }
        ]);
        await deleteRole(roleIdForDelete); // Deleting the selected role
        break;
      case 'Delete Employee':
        // Querying all employees for deletion choices
        const employeesForDelete = await client.query('SELECT * FROM employee');
        const employeeChoicesForDelete = employeesForDelete.rows.map(emp => ({ name: `${emp.first_name} ${emp.last_name}`, value: emp.id }));

        // Prompting the user to select the employee to delete
        const { employee_id: employeeIdForDelete } = await inquirer.prompt([
          { type: 'list', name: 'employee_id', message: 'Select the employee to delete:', choices: employeeChoicesForDelete }
        ]);
        await deleteEmployee(employeeIdForDelete); // Deleting the selected employee
        break;
      case 'Exit':
        exit = true; // Setting exit flag to true to exit the loop
        break;
      default:
        console.log('Invalid choice'); // Handling invalid choices
        break;
    }
  }
  // Closing the database connection when exiting
  client.end();
}

// Calling the main function and handling any errors
main().catch(err => console.error(err));
