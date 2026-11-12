// MyProject/passport-config.js (Is naam se bilkul nayi file banayein)
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./connection'); // Aapka existing database connection utility

function initialize(passport) {
    passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
        try {
            // 1. Aapke existing database pool se user find karna
            const [rows] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
            const user = rows[0]; // Pehla user select kiya

            if (!user) {
                return done(null, false, { message: 'No user with that username' });
            }

            // 2. Password match karna (Existing password hash check)
            const isMatch = await bcrypt.compare(password,user.password);
            if (isMatch) {
                return done(null, user); // Success: User authentication pass ho gaya
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (e) {
            return done(e); // Kisi error ke case me error pass karna
        }
    }));

    // Session me user ki identity store karne ke liye
    passport.serializeUser((user, done) => done(null, user.id));
    
    // Har request par identity verify karne ke liye database se fetch karna
    passport.deserializeUser(async (id, done) => {
        try {
            const [rows] = await db.query('SELECT * FROM user WHERE id = ?', [id]);
            done(null, rows[0]);
        } catch (e) {
            done(e);
        }
    });
}

module.exports = initialize;