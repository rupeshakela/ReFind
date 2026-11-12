// MyProject/middleware/loggedin.js

const isLoggedIn = (req, res, next) => {
    console.log(req.user);
    if (!req.isAuthenticated()) {
        return res.redirect("/login");
    }
    next();
};


const isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/prds'); // Pehle se login user ko products page par bhej dega
};

// Ek se zyada function export karne ke liye hum unhe object {} mein daal dete hain
module.exports = {
    isLoggedIn,
    isNotLoggedIn
};
