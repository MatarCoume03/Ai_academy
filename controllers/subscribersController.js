const Subscriber = require("../models/subscriber");
const mongoose = require('mongoose');
exports.getAllSubscribers = (req, res, next) => {
Subscriber.find({})
.exec()
.then(subscribers => {
res.render("subscribers/index", {
subscribers: subscribers
});
})
.catch(error => {
console.log(`Erreur lors de la récupération des abonnés: ${error.message}`);
next(error);
});
};
exports.getSubscriptionPage = (req, res) => {
    res.render("subscribers/new", {
        errors: [], 
        formData: {}, 
        pageTitle: "Nouvel abonnement" 
    });
};
exports.saveSubscriber = (req, res) => {
    const { name, email, zipCode } = req.body;
    const errors = [];

    if (!name || name.trim() === '') {
        errors.push('Le nom est requis');
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Email invalide');
    }

    if (!zipCode || isNaN(zipCode) || zipCode < 10000 || zipCode > 99999) {
        errors.push('Code postal invalide (doit être 5 chiffres)');
    }

    if (errors.length > 0) {
        return res.render("subscribers/new", {
            errors: errors,
            formData: req.body,
            pageTitle: "Nouvel abonnement"
        });
    }

    let newSubscriber = new Subscriber({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        zipCode: Number(zipCode)
    });

    newSubscriber.save()
        .then(result => {
            req.flash('success_msg', 'Inscription réussie !');
            res.render("subscribers/thanks", {
                pageTitle: "Merci !"
            });
        })
        .catch(error => {
            if (error.code === 11000) {
                errors.push('Cet email est déjà utilisé');
            } else {
                errors.push('Une erreur est survenue');
            }
            res.render("subscribers/new", {
                errors: errors,
                formData: req.body,
                pageTitle: "Nouvel abonnement"
            });
        });
};
exports.show = async (req, res, next) => {
    try {
        // Vérifie si l'ID est un ObjectId valide
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).render('error', {
                pageTitle: "Erreur 400",
                errorCode: 400,
                message: "ID d'abonné invalide"
            });
        }

        const subscriber = await Subscriber.findById(req.params.id);
        
        if (!subscriber) {
            return res.status(404).render('error', {
                pageTitle: "Abonné introuvable",
                errorCode: 404,
                message: "L'abonné demandé n'existe pas"
            });
        }

        res.render("subscribers/show", {
            subscriber: subscriber,
            pageTitle: `Détails de ${subscriber.name}`
        });
    } catch (error) {
        console.error(`Erreur: ${error.message}`);
        next(error);
    }
};
/*exports.show = (req, res, next) => {
let subscriberId = req.params.id;
Subscriber.findById(subscriberId)
.then(subscriber => {
res.render("subscribers/show", {
subscriber: subscriber
});
})
.catch(error => {
console.log(`Erreur lors de la récupération d'un abonné par ID: ${error.message}`);
next(error);
});
};*/

exports.deleteSubscriber = (req, res, next) => {
    Subscriber.findByIdAndDelete(req.params.id)
        .then(() => {
            req.flash('success_msg', 'Abonné supprimé avec succès');
            res.redirect('/subscribers');
        })
        .catch(error => {
            req.flash('error_msg', 'Erreur lors de la suppression');
            console.error('Erreur suppression:', error);
            res.redirect('/subscribers');
        });
};
exports.getEditPage = (req, res, next) => {
    let subscriberId = req.params.id;
    Subscriber.findById(subscriberId)
        .then(subscriber => {
            res.render("subscribers/edit", {
                subscriber: subscriber,
                pageTitle: "Modifier abonné"
            });
        })
        .catch(error => next(error));
};

exports.updateSubscriber = (req, res, next) => {
    let subscriberId = req.params.id;
    Subscriber.findByIdAndUpdate(subscriberId, {
        name: req.body.name,
        email: req.body.email,
        zipCode: req.body.zipCode
    }, { new: true })
        .then(subscriber => {
            req.flash('success_msg', 'Abonné mis à jour avec succès');
            res.redirect(`/subscribers/${subscriber._id}`);
        })
        .catch(error => next(error));
};
exports.searchSubscribers = async (req, res, next) => {
    try {
        const searchTerm = req.query.q;
        
        if (!searchTerm || searchTerm.trim() === '') {
            return res.redirect('/subscribers');
        }

        // Construction robuste de la requête
        const query = {};
        
        if (isNaN(searchTerm)) {
            // Recherche textuelle
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } }
            ];
        } else {
            // Recherche numérique (code postal)
            const zipCode = parseInt(searchTerm);
            if (!isNaN(zipCode)) {
                query.zipCode = zipCode;
            }
        }

        const subscribers = await Subscriber.find(query);
        
        res.render("subscribers/index", {
            subscribers: subscribers,
            searchTerm: searchTerm,
            pageTitle: `Résultats pour "${searchTerm}"`
        });

    } catch (error) {
        console.error('Erreur recherche:', error);
        req.flash('error_msg', 'Une erreur est survenue lors de la recherche');
        next(error);
    }
};