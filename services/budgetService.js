// Importing the client instance from the database configuration file
const client = require('../config/db');

// Defining an asynchronous function to view the budget for a specific department
async function viewBudgetForDepartment(departmentId) {
  // Executing a SQL query to calculate the total utilized budget for a department
  const result = await client.query(`
    SELECT d.name AS department, SUM(r.salary) AS utilized_budget
    FROM employee e
    JOIN role r ON e.role_id = r.id
    JOIN department d ON r.department_id = d.id
    WHERE d.id = $1
    GROUP BY d.name
  `, [departmentId]); // $1 is a placeholder for the departmentId parameter

  // Displaying the result in a table format
  console.table(result.rows);
}

// Exporting the viewBudgetForDepartment function for use in other parts of the application
module.exports = { viewBudgetForDepartment };
