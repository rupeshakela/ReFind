// const mysql = require("mysql2");

// const connection = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     database: "Product",
//     password: "Rupesh@New2026"
// });

// connection.connect((err) => {
//     if (err) {
//         console.log("something happened wrong", err.message);
//         return;
//     }
//     console.log("database connection successful");
// });

// module.exports = connection.promise();





require("dotenv").config();

const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

const config = isProduction
    ? {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
            ca: fs.readFileSync(
                path.join(__dirname, "certs", "ca.pem")
            )
        }
    }
    : {
        host: "localhost",
        user: "root",
        database: "Product",
        password: process.env.LOCAL_DB_PASSWORD
    };

const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err.message);
        return;
    }

    console.log("Database connection successful");
});

module.exports = connection.promise();