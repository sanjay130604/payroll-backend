const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");

router.get("/dashboard", adminAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

module.exports = router;
