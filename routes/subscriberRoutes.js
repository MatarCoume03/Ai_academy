const express = require("express");
const router = express.Router();
const subscribersController = require("../controllers/subscribersController");
const authController = require("../controllers/authController");

router.use(authController.ensureLoggedIn);
router.get("/subscribers", subscribersController.getAllSubscribers);
router.get("/subscribers/new", subscribersController.getSubscriptionPage);
router.post("/subscribers/create", subscribersController.saveSubscriber);
router.get("/subscribers/search", subscribersController.searchSubscribers);
router.get("/subscribers/:id", subscribersController.show);
router.delete("/subscribers/:id", subscribersController.deleteSubscriber);
router.get("/subscribers/:id/edit", subscribersController.getEditPage);
router.post("/subscribers/:id/update", subscribersController.updateSubscriber);
module.exports = router;