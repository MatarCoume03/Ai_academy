// Imports
const express = require("express");
const layouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user");
const routes = require("./routes/index");
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const subscribersController = require("./controllers/subscribersController");
const usersController = require("./controllers/usersController");
const coursesController = require("./controllers/coursesController");
const authController = require("./controllers/authController");

const app = express();

// Configuration du port
app.set("port", process.env.PORT || 3000);

// Configuration d'EJS
app.set("view engine", "ejs");
app.use(layouts);

// Middleware pour fichiers statiques
app.use(express.static("public"));

// Body Parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session et cookies
app.use(cookieParser("secret_passcode"));
app.use(session({
    secret: "secret_passcode",
    cookie: { maxAge: 4000000, secure: false },
    resave: false,
    saveUninitialized: false
}));

// Passport (Authentification)
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Method Override
app.use(methodOverride("_method", {
    methods: ["POST", "GET"]
}));

// Flash Messages
app.use(flash());

// Variables locales
app.use((req, res, next) => {
    res.locals.pageTitle = "AI Academy";
    res.locals.flashMessages = req.flash();
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    res.locals.success_msg = req.flash('success_msg') || [];
    res.locals.error_msg = req.flash('error_msg') || [];
    res.locals.info_msg = req.flash('info_msg') || [];
    next();
});

// Connexion MongoDB
mongoose.connect("mongodb://localhost:27017/ai_academy", { 
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.once("open", () => console.log("Connecté à MongoDB avec Mongoose!"));
db.on("error", console.error.bind(console, "Erreur de connexion MongoDB:"));

// Routes principales (modulaires)
app.use("/", routes);

// Définir les routes
app.get("/", homeController.index);
app.get("/about", homeController.about);
app.get("/courses", homeController.courses);
app.get("/contact", homeController.contact);

// Routes supplémentaires
app.get("/about", homeController.about);
app.get("/contact", homeController.contact);
app.post("/contact", homeController.processContact);
app.get("/faq", homeController.faq);
app.get("/notification", homeController.notification);

// Routes Abonnés
app.get("/subscribers", subscribersController.getAllSubscribers);
app.get("/subscribers/new", subscribersController.getSubscriptionPage);
app.post("/subscribers/create", subscribersController.saveSubscriber);
app.get("/subscribers/search", subscribersController.searchSubscribers);
app.get("/subscribers/:id", subscribersController.show);
app.delete("/subscribers/:id", subscribersController.deleteSubscriber);
app.get("/subscribers/:id/edit", subscribersController.getEditPage);
app.put("/subscribers/:id/update", subscribersController.updateSubscriber);

// Routes Utilisateurs
app.get("/users", authController.ensureLoggedIn, usersController.index, usersController.indexView);
app.get("/users/new", usersController.new);
app.post("/users/create", usersController.create, usersController.redirectView);
app.get("/users/:id", authController.ensureLoggedIn, usersController.show, usersController.showView);
app.get("/users/:id/edit", authController.ensureLoggedIn, usersController.edit);
app.put("/users/:id/update", authController.ensureLoggedIn, usersController.update, usersController.redirectView);
app.delete("/users/:id/delete", authController.ensureLoggedIn, usersController.delete, usersController.redirectView);

// Routes Cours
app.get("/courses", coursesController.index, coursesController.indexView);
app.get("/courses/new", authController.ensureLoggedIn, coursesController.new);
app.post("/courses/create", authController.ensureLoggedIn, coursesController.create, coursesController.redirectView);
app.get("/courses/:id", coursesController.show, coursesController.showView);
app.get("/courses/:id/edit", authController.ensureLoggedIn, coursesController.edit);
app.put("/courses/:id/update", authController.ensureLoggedIn, coursesController.update, coursesController.redirectView);
app.delete("/courses/:id/delete", authController.ensureLoggedIn, coursesController.delete, coursesController.redirectView);

// Routes d'authentification
app.get("/login", authController.login);
app.post("/login", authController.authenticate);
app.get("/logout", authController.logout, usersController.redirectView);
app.get("/signup", authController.signup);
app.post("/signup", authController.register, usersController.redirectView);

// Gestion des erreurs
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

// Démarrage du serveur
app.listen(app.get("port"), () => {
    console.log(`Serveur démarré sur http://localhost:${app.get("port")}`);
});