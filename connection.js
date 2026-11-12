const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "Product",
    password: "Rupesh@New2026"
});

connection.connect((err) => {
    if (err) {
        console.log("something happened wrong", err.message);
        return;
    }
    console.log("database connection successful");
});

module.exports = connection.promise();