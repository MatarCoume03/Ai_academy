const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
// API Routes
router.use(apiController.verifyToken);
// Utilisateurs
router.get("/users", apiController.getAllUsers);
router.get("/users/:id", apiController.getUserById);
router.post("/users", apiController.createUser);
router.put("/users/:id", apiController.updateUser);
router.delete("/users/:id", apiController.deleteUser);
// Cours
router.get("/courses", apiController.getAllCourses);
router.get("/courses/:id", apiController.getCourseById);
router.post("/courses", apiController.createCourse);
router.put("/courses/:id", apiController.updateCourse);
router.delete("/courses/:id", apiController.deleteCourse);
// Abonnés
router.get("/subscribers", apiController.getAllSubscribers);
router.get("/subscribers/:id", apiController.getSubscriberById);
router.post("/subscribers", apiController.createSubscriber);
router.put("/subscribers/:id", apiController.updateSubscriber);
router.delete("/subscribers/:id", apiController.deleteSubscriber);
// Génération de token pour l'API
router.post("/login", apiController.apiAuthenticate);
module.exports = router;