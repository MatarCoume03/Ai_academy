const express = require("express");
const router = express.Router();
const coursesController = require("../controllers/coursesController");
const authController = require("../controllers/authController");

router.use(authController.ensureLoggedIn);
router.get("/courses", coursesController.index, coursesController.indexView);
router.get("/courses/new", coursesController.new);
router.post("/courses/create", coursesController.create, coursesController.redirectView);
router.get("/courses/:id", coursesController.show, coursesController.showView);
router.get("/courses/:id/edit", coursesController.edit);
router.put("/courses/:id/update", coursesController.update, coursesController.redirectView);
router.delete("/courses/:id/delete", coursesController.delete, coursesController.redirectView);
module.exports = router;