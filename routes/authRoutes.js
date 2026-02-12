const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/authController");

router.post("/login", ctrl.login);
router.post("/forgot", ctrl.forgot);
router.post("/reset", ctrl.reset);

module.exports = router;
