
require("dotenv").config();

const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

const ExpressError = require("./ExpressError");
const mysql = require("mysql2");
const { send } = require("process");
const methodOverride = require("method-override");

const { schema, idSchema, userSchema, loginSchema } = require("./schema");
const { isLoggedIn, isNotLoggedIn } = require("./middleware/loggedin");

const login = require("./authentication/login");
const signin = require("./authentication/signin");
const logout = require("./authentication/logout");

const connection = require("./connection");

const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const mysqlPromise = require("mysql2/promise");

const passport = require("passport");
const initializePassport = require("./passport-config");
initializePassport(passport);

const flash = require("connect-flash");
app.set('view engine', 'ejs');
const isProduction = process.env.NODE_ENV === "production";

const sessionPool = isProduction
    ? mysqlPromise.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
            ca: fs.readFileSync(
                path.join(__dirname, "certs", "ca.pem")
            )
        },
        connectionLimit: 2
    })
    : null;

const sessionStore = isProduction
    ? new MySQLStore({}, sessionPool)
    : undefined;
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(methodOverride("_method"));
if (isProduction) {
    app.set("trust proxy", 1);
}

app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax"
    }
}));
app.use(flash());
app.use(passport.initialize()); 
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.currentUser = req.user || null; 
    next();
});
app.use(login);
app.use(signin);
app.use(logout);

//Error handler Middleware
function asyncWrap(fn){
    return function(req,res,next){
        fn(req,res,next).catch((err)=>next(err));
    }
} 
//This is all API call


app.get("/", (req, res) => {
    res.redirect("/prds");
});



app.get("/prds",asyncWrap(async(req,res)=>{
    const {category}=req.query;
    let q="SELECT * FROM PRODUCTS";
    let params=[];

    if(category){
        q+=" WHERE category =?";
        params.push(category)
    }
    const[results]=await connection.query(q,params);
    res.render("index.ejs", { results });
}));

//Add New product
app.get("/prds/new",isLoggedIn,(req,res)=>{
    res.render("new.ejs");
});

app.post("/prds/new",isLoggedIn,asyncWrap(async(req,res)=>{
    const { error, value } = schema.validate(req.body);
    if(error){
        return res.status(400).send(error.message);
    }else{
        let{image,description,price,category}=value;
        let user_id = req.user.id;
        let seller_name = req.user.username;
        let q="INSERT INTO PRODUCTS(image,description,price,seller_name,category,user_id)values(?,?,?,?,?,?)";
        await connection.query(q,[image,description,price,seller_name,category,user_id]);
        res.redirect("/prds");
    }
}));


//Details regarding Product
app.get("/prds/:id",asyncWrap(async(req,res)=>{
    const {error, value} = idSchema.validate({
        id: req.params.id
    });
    if(error){
        return res.status(400).send(error.message);
    }
    let id=value.id;
    let q="SELECT * FROM PRODUCTS WHERE ID =?";
    let [result] = await connection.query(q, [id]);
    if (!result.length) {
    return res.status(404).send("Product not found");
    }
    res.render("show.ejs", { result });
}));

//Edit your Product Details
app.get("/prds/:id/edit",isLoggedIn,asyncWrap(async(req,res)=>{
    const {error, value} = idSchema.validate({
        id: req.params.id
    });
    if(error){
        return res.status(404).send(error.message);
    }else{
        let id=value.id;
        let q="SELECT * FROM PRODUCTS WHERE ID =?";
        let [result]=await connection.query(q,[id]);
        res.render("edit.ejs",{result});
    }
}));

app.patch("/prds/:id/edit",asyncWrap(async(req,res)=>{
    const{error,value}=schema.validate(req.body);
    const { error: idError, value: idValue } = idSchema.validate({
    id: req.params.id
    });
    if(error||idError){
         return res.status(400).send(error ? error.message : idError.message);
    }else{
        let{image,description,price,seller_name,category}=value;
        let id=idValue.id;
        //This is checking server side Authorization
        const[currProduct]=await connection.query("SELECT USER_ID FROM PRODUCTS WHERE id=?",[id]);
        if(!currProduct.length){
            return res.status(404).send("Product not found");
        }
        if(currProduct[0].USER_ID!==req.user.id){
            return res.status(403).send("You are not authorized");
        }
        let q="UPDATE PRODUCTS SET image=?,description=?,price=?,seller_name=?,category=? WHERE id=?";
        await connection.query(q,[image,description,price,seller_name,category,id]);
        res.redirect("/prds");
    }
}));
//Delete your product
app.delete("/prds/:id",isLoggedIn,asyncWrap(async(req,res)=>{
    const {error, value} = idSchema.validate({
        id: req.params.id
    });
    if(error){
        return res.status(400).send(error.message);
    }else{
        let id=value.id;
        //This is checking server side Authorization
        const[currProduct]=await connection.query("SELECT USER_ID FROM PRODUCTS WHERE id=?",[id]);
        if(!currProduct.length){
            return res.status(404).send("Product not found");
        }
        if(currProduct[0].USER_ID!==req.user.id){
            return res.status(403).send("You are not authorized");
        }
        let q="DELETE FROM PRODUCTS WHERE id=?";
        await connection.query(q,[id]);
        res.redirect("/prds");
    }
}));

const port=8080;
app.listen(port,()=>{
    console.log(`server is listing at port ${port}`);
});