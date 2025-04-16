const Course = require("../models/course");
const mongoose = require('mongoose');
// Fonction utilitaire pour extraire les paramètres du cours du corps de la requête
const getCourseParams = body => {
return {
title: body.title,
description: body.description,
maxStudents: body.maxStudents,
cost: body.cost
};
};
module.exports = {
index: (req, res, next) => {
Course.find({})
.then(courses => {
res.locals.courses = courses;
next();
})
.catch(error => {
console.log(`Erreur lors de la récupération des cours: ${error.message}`);
next(error);
});
},
indexView: (req, res) => {
res.render("courses/index");
},
new: (req, res) => {
res.render("courses/new");
},
create: (req, res, next) => {
let courseParams = getCourseParams(req.body);
Course.create(courseParams)
.then(course => {

res.locals.redirect = "/courses";
res.locals.course = course;
next();
})
.catch(error => {
console.log(`Erreur lors de la création du cours: ${error.message}`);
res.locals.redirect = "/courses/new";
next();
});
},
redirectView: (req, res, next) => {
let redirectPath = res.locals.redirect;
if (redirectPath) res.redirect(redirectPath);
else next();
},
show: (req, res, next) => {
let courseId = req.params.id;
Course.findById(courseId)
.populate("students")
.then(course => {
res.locals.course = course;
next();
})
.catch(error => {
console.log(`Erreur lors de la récupération du cours par ID: ${error.message}`);
next(error);
});
},
showView: (req, res) => {
res.render("courses/show");
},
edit: (req, res, next) => {
let courseId = req.params.id;
Course.findById(courseId)
.then(course => {
res.render("courses/edit", {
course: course
});
})
.catch(error => {
console.log(`Erreur lors de la récupération du cours par ID: ${error.message}`);
next(error);
});
},

update: (req, res, next) => {
let courseId = req.params.id,
courseParams = getCourseParams(req.body);
Course.findByIdAndUpdate(courseId, {
$set: courseParams
})
.then(course => {
res.locals.redirect = `/courses/${courseId}`;
res.locals.course = course;
next();
})
.catch(error => {
console.log(`Erreur lors de la mise à jour du cours par ID: ${error.message}`);
next(error);
});
},
delete: async (req, res) => {
    try {
        const courseId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            req.flash('error_msg', 'ID cours invalide');
            return res.redirect("/courses");
        }

        const deletedCourse = await Course.findByIdAndDelete(courseId);
        
        if (!deletedCourse) {
            req.flash('error_msg', 'Cours non trouvé');
            return res.redirect("/courses");
        }

        req.flash('success_msg', 'Cours supprimé avec succès');
        res.redirect("/courses");
    } catch (error) {
        console.error('Erreur suppression:', error);
        req.flash('error_msg', 'Erreur serveur lors de la suppression');
        res.redirect("/courses");
    }
}
};