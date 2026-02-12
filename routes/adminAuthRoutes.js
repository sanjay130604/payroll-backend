const express = require("express");
const router = express.Router();
const {
  adminLogin,
  sendAdminOtp,
  resetAdminPassword
} = require("../controllers/adminAuthController");

router.post("/login", adminLogin);
router.post("/forgot", sendAdminOtp);
router.post("/reset", resetAdminPassword);

module.exports = router;
