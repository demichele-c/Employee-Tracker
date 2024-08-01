-- Insert departments
INSERT INTO department (name) VALUES 
('Sales'), 
('Engineering'), 
('Finance'), 
('Marketing');

-- Insert roles
INSERT INTO role (title, salary, department_id) VALUES 
('Sales Manager', 60000, 1),
('Salesperson', 45000, 1),
('Engineer', 75000, 2),
('Accountant', 55000, 3),
('Marketing Specialist', 50000, 4);

-- Insert employees
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),
('Jane', 'Smith', 2, 1),
('Robert', 'Brown', 3, NULL),
('Emily', 'Davis', 4, 3),
('Michael', 'Wilson', 5, NULL);