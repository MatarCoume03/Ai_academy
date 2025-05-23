const User = require("../models/user");
const mongoose = require("mongoose");
const jsonWebToken = require("jsonwebtoken");
const token_key = process.env.TOKEN_KEY || "secretTokenKey";
// Fonction utilitaire pour extraire les paramètres utilisateur du corps de la requête
const getUserParams = body => {
return {
name: {
first: body.first,
last: body.last
},
email: body.email,
password: body.password,
zipCode: body.zipCode
};
};
module.exports = {
index: (req, res, next) => {
User.find({})
.then(users => {
res.locals.users = users;
next();
})
.catch(error => {
console.log(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
next(error);
});
},
indexView: (req, res) => {
res.render("users/index");
},
new: (req, res) => {
res.render("users/new");
},
create: (req, res, next) => {
let userParams = getUserParams(req.body);
User.create(userParams)
.then(user => {
res.locals.redirect = "/users";
res.locals.user = user;
next();
})
.catch(error => {
console.log(`Erreur lors de la création de l'utilisateur: ${error.message}`);
res.locals.redirect = "/users/new";
next();
});
},
redirectView: (req, res, next) => {
let redirectPath = res.locals.redirect;
if (redirectPath) res.redirect(redirectPath);
else next();
},
show: (req, res, next) => {
let userId = req.params.id;
User.findById(userId)
.then(user => {
res.locals.user = user;
next();
})
.catch(error => {

console.log(`Erreur lors de la récupération de l'utilisateur par ID: ${error.message}`);
next(error);
});
},
showView: (req, res) => {
res.render("users/show");
},
edit: (req, res, next) => {
let userId = req.params.id;
User.findById(userId)
.then(user => {
res.render("users/edit", {
user: user
});
})
.catch(error => {
console.log(`Erreur lors de la récupération de l'utilisateur par ID: ${error.message}`);
next(error);
});
},
update: (req, res, next) => {
let userId = req.params.id,
userParams = getUserParams(req.body);
User.findByIdAndUpdate(userId, {
$set: userParams
})
.then(user => {
res.locals.redirect = `/users/${userId}`;
res.locals.user = user;
next();
})
.catch(error => {
console.log(`Erreur lors de la mise à jour de l'utilisateur par ID: ${error.message}`);
next(error);
});
},
delete: async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            req.flash('error_msg', 'ID utilisateur invalide');
            return res.redirect("/users");
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            req.flash('error_msg', 'Utilisateur non trouvé');
            return res.redirect("/users");
        }

        req.flash('success_msg', 'Utilisateur supprimé avec succès');
        res.redirect("/users");
    } catch (error) {
        console.error('Erreur suppression:', error);
        req.flash('error_msg', 'Erreur serveur lors de la suppression');
        res.redirect("/users");
    }
},
// Dans usersController.js
getApiToken: (req, res) => {
    if (req.user) {
    let signedToken = jsonWebToken.sign(
    {
    data: req.user._id,
    exp: new Date().setDate(new Date().getDate() + 30) // Token valable 30 jours
    },
    token_key
    );
    res.render("users/api-token", {
    token: signedToken
    });
    } else {
    req.flash("error", "Vous devez être connecté pour obtenir un token API.");
    res.redirect("/login");
    }
    }
};