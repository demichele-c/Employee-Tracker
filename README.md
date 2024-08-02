# Employee-Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

## Description

The Employee Tracker is a simple command-line tool that helps companies manage employee information. It is built with Node.js and PostgreSQL, and lets users easily view, add, and update information about employees, their roles, and departments. By using an interactive interface, users can follow prompts to perform various tasks, reducing the chances of errors that come with manual record-keeping. This tool ensures that all employee data is stored accurately in a central database, making it easier for HR departments and managers to keep track of everyone in the company.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Tests](#tests)
- [Questions](#questions)
- [License](#license)

## Installation

To install and run the Employee Tracker application, first clone the repository with git clone https://github.com/demichele-c/Employee-Tracker.git and navigate to the project directory. Install dependencies using npm install, and set up PostgreSQL by creating a database named employee_db. Run the schema and seed SQL files with psql -U postgres, enter password. Run \i schema.sql, \i seeds.sql, then \i query.sql. Finally, start the application with node index.js and follow the interactive menu to manage employee data.

## Usage



## Contributing

To use the Employee Tracker application, simply run it and choose from the menu options to view departments, roles, or employees, or to add and update data. Use the arrow keys to navigate and select actions like adding a department, role, or employee, or updating an employee's role. The application will guide you through the required prompts for each action.

## Tests

To test the Employee Tracker application, first ensure the PostgreSQL database is set up and seeded with data by running the schema.sql and seeds.sql files. Then, run the application using node index.js and navigate through the menu options to verify that all features (viewing, adding, and updating departments, roles, and employees) work as expected. Check the console for any errors or issues and validate that data is correctly stored and retrieved from the database.

## Questions

If you have any questions, please feel free to contact me at [demichele.charles@yahoo.com](mailto:demichele.charles@yahoo.com). You can also find more of my work at [demichele-c](https://github.com/demichele-c).

## License

This project is licensed under the MIT license. Click [here](https://opensource.org/licenses/MIT) for more details.
