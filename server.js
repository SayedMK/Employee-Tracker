const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');



//const db = require('./db/connection');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'AstonRoot',
    database: 'employee_tracker'
});

//function to update an employee role
updateEmployeeRole = () => {
    const sql = `SELECT * FROM employee`;

    connection.promise().query(sql, (err, data) => {
        if (err) throw err;

        const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: 'Which employee\'s role do you want to update?',
                choices: employees
            }
        ]).then((empChoice) => {
            const employee = empChoice.employee;
            const params = [];
            params.push(employee);

            const roleSql = `SELECT * FROM role`;

            connection.promise().query(roleSql, (err, data) => {
                if (err) throw err;

                const roles = data.map(({ id, title }) => ({ name: title, value: id }));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: 'What is the new role of the employee?',
                        choices: roles
                    }
                ]).then((roleChoice) => {
                    const role = roleChoice.role;
                    params.push(role);
                    params.reverse();

                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                    connection.promise().query(sql, params, (err, res) => {
                        if (err) throw err;
                        console.log('Employee role updated!\n');

                        showEmployees();
                    });
                });
            });
        });
    });
}

db.connect(err => {
    if (err) throw err;
    console.log('Database connected.');
    start();
});

//inquirer prompts to start the application
const start = () => {
    inquirer.prompt({
        type: 'list',
        name: 'choices',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ]
    }).then((answers) => {
        switch (answers.choices) {
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'Exit':
                db.end();
                break;
        }
    });
};

//function to view all departments
showDepartments = () => {
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
};

//function to show all roles
showRules = () => {
    console.log('Selecting all roles...\n');

    const sql = `SELECT role.id, role.title, department.name AS department, role.salary 
                 FROM role LEFT JOIN department ON role.department_id = department.id`;

    connection.promise().query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    })
};

//function to show all employees
showEmployees = () => {
    console.log('Selecting all employees...\n');

    const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, 
                 CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                 FROM employee 
                 LEFT JOIN role ON employee.role_id = role.id
                 LEFT JOIN department ON role.department_id = department.id
                 LEFT JOIN employee manager ON employee.manager_id = manager.id`;

    connection.promise().query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    })
};

//function to add a department
addDepartment = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'Enter the name of department you would like to add:',
            validate: addDepartment => {
                if (addDepartment) {
                    return true;
                } else {
                    console.log('Please enter a department name!');
                    return false;
                }
            }
        }
    ]).then((answers) => {
        const sql = `INSERT INTO department (name) VALUES (?)`;

        connection.promise().query(sql, answers.department, (err, res) => {
        if (err) throw err;
        console.log('Department added!\n');

        showDepartments();
        });
    });
};

//function to add a role
addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'Enter the title of the role you would like to add:',
            validate: addRole => {
                if (addRole) {
                    return true;
                } else {
                    console.log('Please enter a role title!');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary of the role you would like to add:',
            validate: addRole => {
                if (addRole) {
                    return true;
                } else {
                    console.log('Please enter a salary!');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'department_id',
            message: 'Enter the department ID of the role you would like to add:',
            validate: addRole => {
                if (addRole) {
                    return true;
                } else {
                    console.log('Please enter a department ID!');
                    return false;
                }
            }
        }
    ]).then((answers) => {
        const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;

        connection.promise().query(sql, [answers.title, answers.salary, answers.department_id], (err, res) => {
        if (err) throw err;
        console.log('Role added!\n');

        showRoles();
        });
    })};

//function to add an employee
addEmployee = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'What is the first name of the employee you would like to add?',
            validate: addFirst => {
                if (addFirst) {
                    return true;
                } else {
                    console.log('Please enter a first name!');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'What is the last name of the employee you would like to add?',
            validate: addLast => {
                if (addLast) {
                    return true;
                } else {
                    console.log('Please enter a last name!');
                    return false;
                }
            }
        }
    ]).then((answers) => {
        const params = [answers.firstName, answers.lastName];

        const roleSql = `SELECT role.id, role.title FROM role`;
        connection.promise().query(roleSql, (err, data) => {
            if (err) throw err;

            const roles = data.map(({ id, title }) => ({ name: title, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is the role of the employee?',
                    choices: roles
                }
            ]).then((roleChoice) => {
                const role = roleChoice.role;
                params.push(role);

                const managerSql = `SELECT * FROM employee`;
                connection.promise().query(managerSql, (err, data) => {
                    if (err) throw err;

                    const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + ' ' + last_name, value: id }));

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: 'Who is the manager of the employee?',
                            choices: managers
                        }
                    ]).then((managerChoice) => {
                        const manager = managerChoice.manager;
                        params.push(manager);

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;

                        connection.promise().query(sql, params, (err, res) => {
                            if (err) throw err;
                            console.log('Employee added!\n');

                            showEmployees();
                        });
                    });
                });
            });
        });
    });
}
