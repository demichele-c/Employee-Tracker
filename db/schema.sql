-- Drop tables if they already exist
-- This ensures that if any of the tables already exist, they will be removed
-- before creating new ones
DROP TABLE IF EXISTS employee;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS department;

-- Create tables

-- Create the department table
-- This table holds information about different departments
CREATE TABLE department (
    id SERIAL PRIMARY KEY,          -- Unique identifier for each department
    name VARCHAR(30) UNIQUE NOT NULL  -- Department name, must be unique and cannot be null
);

-- Create the role table
-- This table holds information about various roles within the company
CREATE TABLE role (
    id SERIAL PRIMARY KEY,         -- Unique identifier for each role
    title VARCHAR(30) UNIQUE NOT NULL, -- Role title, must be unique and cannot be null
    salary DECIMAL NOT NULL,        -- Salary for the role
    department_id INTEGER NOT NULL, -- Foreign key referencing the department
    FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE  -- Ensures role is linked to an existing department, and if the department is deleted, all associated roles will also be deleted
);

-- Create the employee table
-- This table holds information about employees
CREATE TABLE employee (
    id SERIAL PRIMARY KEY,         -- Unique identifier for each employee
    first_name VARCHAR(30) NOT NULL,  -- Employee's first name, cannot be null
    last_name VARCHAR(30) NOT NULL,   -- Employee's last name, cannot be null
    role_id INTEGER NOT NULL,        -- Foreign key referencing the role of the employee
    manager_id INTEGER,             -- Foreign key referencing the manager of the employee, can be null
    FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL,  -- Ensures employee role is linked to an existing role, and if the role is deleted, the employee's role is set to NULL
    FOREIGN KEY (manager_id) REFERENCES employee(id)  -- Ensures manager is an existing employee, allows null for employees without managers
);

-- Update role table to set ON DELETE CASCADE for department_id foreign key constraint
-- Remove the existing foreign key constraint if it exists
ALTER TABLE role
DROP CONSTRAINT IF EXISTS role_department_id_fkey;

-- Add the new foreign key constraint with ON DELETE CASCADE
ALTER TABLE role
ADD CONSTRAINT role_department_id_fkey
FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE;
