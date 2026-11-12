const express = require("express");
const router = express.Router();
const passport = require('passport');
const bcrypt = require("bcrypt");
const connection = require("../connection");
const { loginSchema } = require("../schema");

router.get("/login",(req,res)=>{
    res.render("login.ejs");
});
router.post("/login",(req,res,next)=>{
    const{error,value}=loginSchema.validate(req.body);
    if(error){
        req.flash('error_msg', error.message);
        return res.redirect("/login");
    }
    passport.authenticate('local',{
        successRedirect:'/prds',
        failureRedirect:'/login',
        failureFlash:false
    })(req, res, next);
});
module.exports = router;