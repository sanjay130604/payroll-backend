const express = require("express");
const router = express.Router();

const {
  getPayrollByEmail,
  updatePayrollByEmail,
  getSalaryHistoryByEmail,
  generateSalaryPDF,
  updatePayroll,
  getPayrollByEmployeeId,
  getAttendanceByEmployeeId
} = require("../controllers/payrollController");

/**
 * USER PAYROLL ROUTES
 */

router.get("/by-email", getPayrollByEmail);
router.post("/update-by-email", updatePayrollByEmail);
router.get("/history", getSalaryHistoryByEmail);
router.get("/by-employee-id", getPayrollByEmployeeId);
router.get("/attendance", getAttendanceByEmployeeId);


router.post("/generate-pdf", generateSalaryPDF);
router.post("/update", updatePayroll);

module.exports = router;
