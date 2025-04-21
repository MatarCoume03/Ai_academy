const methodOverride = require('method-override');
const express = require("express");
const layouts = require("express-ejs-layouts");
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require("cookie-parser");
const passport = require("passport");
const User = require("./models/user");
const mongoose = require("mongoose"); // Ajout de Mongoose
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const subscribersController = require("./controllers/subscribersController");
const usersController = require("./controllers/usersController");
const coursesController = require("./controllers/coursesController");
const app = express();
// Définir le port
app.set("port", process.env.PORT || 3000);
// Configuration d'EJS comme moteur de template
app.set("view engine", "ejs");
app.use(layouts);
// Middleware pour traiter les données des formulaires
app.use(
express.urlencoded({
extended: false
})
);
app.use(express.json());
// Configuration des cookies et des sessions
app.use(cookieParser("secret_passcode"));
app.use(session({
secret: "secret_passcode",
cookie: {
maxAge: 4000000
},
resave: false,
saveUninitialized: false
}));
// Configuration de Passport
app.use(passport.initialize());
app.use(passport.session());
//app.use(methodOverride('_method'));
app.use(methodOverride("_method", {
methods: ["POST", "GET"]
}));
app.use(session({
    secret: 'votre_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mettez à true si vous utilisez HTTPS
}));
app.get('/notification', homeController.notification);
app.use(flash());
// Middleware pour rendre les messages disponibles dans toutes les vues
app.use((req, res, next) => {
    // Transfert des messages flash vers res.locals
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.info_msg = req.flash('info_msg');
    
    // Initialisation si non défini
    if (!res.locals.success_msg) res.locals.success_msg = [];
    if (!res.locals.error_msg) res.locals.error_msg = [];
    if (!res.locals.info_msg) res.locals.info_msg = [];
    
    next();
});
// Middleware pour rendre les variables locales disponibles dans toutes les vues
app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});
app.use((req, res, next) => {
    res.locals.pageTitle = "AI Academy"; // Valeur par défaut
    next();
});
// Configuration de la connexion à MongoDB
mongoose.connect(
    "mongodb://localhost:27017/ai_academy",
    { useNewUrlParser: true }
    );
    const db = mongoose.connection;
    db.once("open", () => {
    console.log("Connexion réussie à MongoDB en utilisant Mongoose!");
    });
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// Servir les fichiers statiques
app.use(express.static("public"));
// Définir les routes
app.get("/", homeController.index);
app.get("/about", homeController.about);
app.get("/courses", homeController.courses);
app.get("/contact", homeController.contact);
// Routes pour les abonnés
app.get("/subscribers", subscribersController.getAllSubscribers);
app.get("/subscribers/new", subscribersController.getSubscriptionPage);
app.post("/subscribers/create", subscribersController.saveSubscriber);
app.get("/subscribers/search", subscribersController.searchSubscribers);
app.get("/subscribers/:id", subscribersController.show);
app.delete("/subscribers/:id", subscribersController.deleteSubscriber);
app.get("/subscribers/:id/edit", subscribersController.getEditPage);
app.post("/subscribers/:id/update", subscribersController.updateSubscriber);
// Routes pour les utilisateurs
app.get("/users", usersController.index, usersController.indexView);
app.get("/users/new", usersController.new);
app.post("/users/create", usersController.create, usersController.redirectView);
app.get("/users/:id", usersController.show, usersController.showView);
app.get("/users/:id/edit", usersController.edit);
app.put("/users/:id/update", usersController.update, usersController.redirectView);
app.delete("/users/:id/delete", usersController.delete, usersController.redirectView);
// Routes pour les cours
app.get("/courses", coursesController.index, coursesController.indexView);
app.get("/courses/new", coursesController.new);
app.post("/courses/create", coursesController.create, coursesController.redirectView);
app.get("/courses/:id", coursesController.show, coursesController.showView);
app.get("/courses/:id/edit", coursesController.edit);
app.put("/courses/:id/update", coursesController.update, coursesController.redirectView);
app.delete("/courses/:id/delete", coursesController.delete, coursesController.redirectView);
// Ajoutez cette ligne après les autres routes GET
app.get("/faq", homeController.faq);
app.post("/contact", homeController.processContact);
// Gestion des erreurs
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);
// Démarrer le serveur
app.listen(app.get("port"), () => {
console.log(`Le serveur a démarré et écoute sur le port: ${app.get("port")}`);
console.log(`Serveur accessible à l'adresse: http://localhost:${app.get("port")}`);
});