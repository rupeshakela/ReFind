const express = require("express");
const router = express.Router();
router.get("/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        res.redirect("/prds");
    });
});
module.exports = router;
