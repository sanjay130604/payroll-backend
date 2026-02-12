// // const Employee = require("../models/Employee");

// // exports.getEmployees = async (req, res) => {
// //   const employees = await Employee.find();
// //   res.json(employees);
// // };

// // exports.getEmployee = async (req, res) => {
// //   const emp = await Employee.findById(req.params.id);
// //   res.json(emp);
// // };

// // exports.updateEmployee = async (req, res) => {
// //   const updated = await Employee.findByIdAndUpdate(
// //     req.params.id,
// //     req.body,
// //     { new: true }
// //   );
// //   res.json(updated);
// // };

// // //

// // // const axios = require("axios");

// // // /* ================= USER PROFILE ================= */
// // // exports.getEmployeeFromSheet = async (req, res) => {
// // //   try {
// // //     const { email } = req.query;

// // //     const r = await axios.post(process.env.SHEET_API, {
// // //       action: "getUserByEmail",
// // //       email
// // //     });

// // //     res.json(r.data);
// // //   } catch (err) {
// // //     res.status(500).json({ success: false });
// // //   }
// // // };

// // // /* ================= PAYROLL ================= */
// // // exports.getPayrollFromSheet = async (req, res) => {
// // //   try {
// // //     const { email } = req.query;

// // //     const r = await axios.post(process.env.SHEET_API, {
// // //       action: "getPayrollByEmail",
// // //       email
// // //     });

// // //     res.json(r.data);
// // //   } catch (err) {
// // //     res.status(500).json({ success: false });
// // //   }
// // // };

// const Employee = require("../models/Employee");

// /**
//  * GET ALL EMPLOYEES (Admin use only)
//  */
// exports.getEmployees = async (req, res) => {
//   try {
//     const employees = await Employee.find();
//     res.json(employees);
//   } catch {
//     res.status(500).json({ message: "Fetch failed" });
//   }
// };

// /**
//  * GET SINGLE EMPLOYEE BY ID
//  */
// exports.getEmployee = async (req, res) => {
//   try {
//     const emp = await Employee.findById(req.params.id);
//     res.json(emp);
//   } catch {
//     res.status(404).json({ message: "Employee not found" });
//   }
// };

// /**
//  * UPDATE EMPLOYEE
//  */
// exports.updateEmployee = async (req, res) => {
//   try {
//     const updated = await Employee.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     res.json(updated);
//   } catch {
//     res.status(500).json({ message: "Update failed" });
//   }
// };

const Employee = require("../models/Employee");

/**
 * GET ALL EMPLOYEES (ADMIN)
 */
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch {
    res.status(500).json({ message: "Fetch failed" });
  }
};

/**
 * GET EMPLOYEE BY ID
 */
exports.getEmployee = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Not found" });
    res.json(emp);
  } catch {
    res.status(404).json({ message: "Employee not found" });
  }
};

/**
 * UPDATE EMPLOYEE
 */
exports.updateEmployee = async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
};
