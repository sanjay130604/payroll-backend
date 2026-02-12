// const express = require("express");
// const router = express.Router();

// const {
//   getPayrollByEmail, 
//   updatePayrollByEmail,
//   getSalaryHistoryByEmail,
//   updatePayroll
// } = require("../controllers/payrollController");

// /**
//  * USER PAYROLL ROUTE (EMAIL BASED)
//  * Example:
//  * GET /api/payroll/by-email?email=user@gmail.com
//  */
// router.get("/by-email", getPayrollByEmail);
// router.post("/update-by-email", updatePayrollByEmail);
// router.get("/history", getSalaryHistoryByEmail);
// //error occur
// router.post("/update", updatePayroll);



// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  getPayrollByEmail,
  updatePayrollByEmail,
  getSalaryHistoryByEmail,
  generateSalaryPDF,
  updatePayroll,
  getPayrollByEmployeeId
} = require("../controllers/payrollController");

/**
 * USER PAYROLL ROUTES
 */

router.get("/by-email", getPayrollByEmail);
router.post("/update-by-email", updatePayrollByEmail);
router.get("/history", getSalaryHistoryByEmail);
router.get("/by-employee-id", getPayrollByEmployeeId);


// ✅ FIXED
// router.get("/download-pdf", downloadSalaryPDF);
router.post("/generate-pdf", generateSalaryPDF);
router.post("/update", updatePayroll);

module.exports = router;
