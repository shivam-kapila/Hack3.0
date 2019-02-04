/*jshint esversion: 6 */
require("dotenv").load();

var express = require("express"),
    ejs = require("ejs"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Admin = require("./models/admin"),
    Team = require("./models/team");
Student = require("./models/student");

//requiring routes
var indexRoutes = require("./routes/index");
var teamRoutes = require("./routes/team");
var adminRoutes = require("./routes/admin");
var studentRoutes = require("./routes/student");
var url = "mongodb://CSECHack3:csechack3@ds119795.mlab.com:19795/entry_to_hack3";
mongoose.connect(url, {
    useNewUrlParser: true
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Hack hai ye hack",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());

app.use(passport.session());

passport.use('team', new LocalStrategy(usedStrategy = 'team', Team.authenticate()));
passport.use('admin', new LocalStrategy(usedStrategy = 'admin', Admin.authenticate()));
passport.use('student', new LocalStrategy(usedStrategy = 'student', Student.authenticate()));

passport.serializeUser(
    function(user, done) {
        if (isTeam(user)) {
            console.log("Team");
            Team.serializeUser();
            done(null, user);
        } else if (isAdmin(user)) {
            console.log(user);
            Admin.serializeUser();
            done(null, user);
        } else if (isStudent(user)) {
            console.log(user);
            Student.serializeUser();
            done(null, user);
        }
    });
passport.deserializeUser(
    function(user, done) {
        if (isTeam(user)) {
            Team.deserializeUser();
            done(null, user);
        } else if (isAdmin(user)) {
            Admin.deserializeUser();
            done(null, user);
        } else if (isStudent(user)) {
            Student.deserializeUser();
            done(null, user);
        }
    });
// // passport.deserializeUser(Admin.deserializeUser());

function isTeam(user) {
    if (user instanceof Team)
        console.log("Team");
    return true;
}

function isAdmin(user) {
    if (user instanceof Admin)
        console.log("Admin");
    return true;
}

function isStudent(user) {
    if (user instanceof Student)
        console.log("Student");
    return true;
}

app.use(function(req, res, next) {
    // res.locals.currentTeam = req.username;
    res.locals.team = req.user;
    res.locals.admin = req.user;
    res.locals.student = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/team", teamRoutes);
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);
app.use(function(req, res, next) {
    res.status(404).render('404', { title: "sorry Page not found" });
});


console.log(process.env.PORT);

app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("Port up and running");
});