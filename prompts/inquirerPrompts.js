// Importing the 'inquirer' library to handle user prompts
const inquirer = require('inquirer');

// Defining an asynchronous function for the main menu
async function mainMenu() {
  // Using 'inquirer' to prompt the user with a list of choices
  const answers = await inquirer.prompt([
    {
      type: 'list',          // The type of prompt - a list of choices
      name: 'choice',        // The key to store the user's answer
      message: 'What would you like to do?', // The question to display to the user
      choices: [             // The list of choices the user can select from
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'View Employees by Manager',
        'View Employees by Department',
        'View Budget for Department',  
        'Add Department',
        'Add Role',
        'Add Employee',
        'Update Employee Role',
        'Update Employee Manager',
        'Delete Department',
        'Delete Role',
        'Delete Employee',
        'Exit'
      ]
    }
  ]);
  // Returning the user's choice to the caller
  return answers.choice;
}

// Exporting the mainMenu function for use in other parts of the application
module.exports = { mainMenu };
