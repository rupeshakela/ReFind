// SignUp page for the user
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const connection = require("../connection");
const { userSchema } = require("../schema");

const asyncWrap = (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch((err) => next(err));
    };
};

router.get("/signin", (req, res) => {
    res.render("signin.ejs");
});

router.post("/signin", asyncWrap(async (req, res, next) => {

    const { error, value } = userSchema.validate(req.body);

    if (error) {
        return res.status(400).send(error.message);
    }

    let { username, email, password } = value;

    let q = "INSERT INTO user(username,email,password) values(?,?,?)";

    const hashedPassword = await bcrypt.hash(password, 10);

    // Change 1: Store the INSERT query result
    const [result] = await connection.query(q, [
        username,
        email,
        hashedPassword
    ]);

    const [rows] = await connection.query(
        "SELECT * FROM user WHERE id = ?",
        [result.insertId]
    );

    const newUser = rows[0];

    // Change 2: Automatically login the new user
    req.login(newUser, (err) => {
        if (err) {
            return next(err);
        }

        res.redirect("/prds");
    });

}));

module.exports = router;