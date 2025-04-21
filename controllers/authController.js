const passport = require("passport");
const User = require("../models/user");

module.exports = {
  login: (req, res) => res.render("auth/login"),

  authenticate: (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        req.flash("error", "Email ou mot de passe incorrect");
        return res.redirect("/login");
      }
  
      req.logIn(user, (err) => {
        if (err) return next(err);
        req.flash("success", `Bienvenue ${user.fullName} ! Ravi de vous revoir 👋`);
        return res.redirect("/");
      });
    })(req, res, next);
  },

  logout: (req, res, next) => {
    req.logout(function(err) {
      if (err) {
        return next(err); // Propagation de l'erreur si besoin
      }
      req.flash("success", "Vous avez été déconnecté avec succès");
      res.redirect("/");
    });
  },  

  signup: (req, res) => res.render("auth/signup"),

  register: (req, res, next) => {
    if (req.body.password !== req.body.confirm_password) {
      req.flash("error", "Les mots de passe ne correspondent pas");
      return res.redirect("/signup");
    }

    const newUser = new User({
      name: {
        first: req.body.first,
        last: req.body.last
      },
      email: req.body.email,
      zipCode: req.body.zipCode
    });

    User.register(newUser, req.body.password, (err, user) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/signup");
      }
      passport.authenticate("local")(req, res, () => {
        req.flash("success", `Bienvenue ${user.fullName}! Votre compte a été créé avec succès.`);
        res.redirect("/");
      });
    });
  },

  ensureLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.flash("error", "Veuillez vous connecter pour accéder à cette page");
    res.redirect("/login");
  }
};