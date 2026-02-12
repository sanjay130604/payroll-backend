const express = require("express");
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  updateEmployee
} = require("../controllers/employeeController");

router.get("/", getEmployees);       // ADMIN
router.get("/:id", getEmployee);     // ADMIN
router.put("/:id", updateEmployee);  // ADMIN

module.exports = router;
