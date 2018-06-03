var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var mysql = require('mysql');


const app = express();
const port = process.env.PORT || 3001;

var options = require("./database").database;
var con = mysql.createConnection(options);
var sessionStore = new MySQLStore(options);
con.connect(function (err) {
    if (err) throw err

});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: '6iRD1oYfv^a7Y2le',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true }
}))
app.use(passport.initialize());
app.use(passport.session());
app.use('/',  express.static("dist"));
app.use('/login', express.static("dist"));
app.use('/wishvacation', authenticationMiddleware(), express.static("dist"));
app.use('/myvacations', authenticationMiddleware(), express.static("dist"));
app.use('/admin', authenticationMiddleware(), express.static("dist"));
require("./passport")(passport, con, bcrypt);
require("./routes")(app, passport, con, bcrypt);
app.use('*', express.static("dist"));
function authenticationMiddleware() {
    return (req, res, next) => {
        console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);
        if (req.isAuthenticated()) return next();
        res.redirect('/login')
    }
}



app.listen(port, () => console.log(`Listening on port ${port}`));