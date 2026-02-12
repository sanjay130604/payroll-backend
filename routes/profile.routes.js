// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const {
//   getAllProfiles,
//   updateProfile
// } = require("../controllers/profile.controller");

// router.get("/all", getAllProfiles);
// router.put("/update", updateProfile);
// router.get("/", async (req, res) => {
//   const { email } = req.query;

//   try {
//     const r = await axios.post(process.env.SHEET_API, {
//       action: "getUserProfile",
//       email
//     });

//     return res.json(r.data);
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: "Profile fetch failed"
//     });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const axios = require("axios");

const {
  getAllProfiles,
  updateProfile,
  bulkUploadProfiles
} = require("../controllers/profile.controller");

/* ================= ADMIN / USER LIST ================= */
router.get("/all", getAllProfiles);
router.put("/update", updateProfile);
router.post("/bulk-upload", bulkUploadProfiles); // ✅ NEW ROUTE

/* ================= GET PROFILE BY EMAIL (USER LOGIN FLOW) ================= */
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const r = await axios.post(process.env.SHEET_API, {
      action: "getEmployeeIdByEmail", // ✅ CORRECT ACTION
      email
    });

    return res.json(r.data);
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Profile fetch failed"
    });
  }
});

/* =====================================================
   GET FULL PROFILE BY EMPLOYEE ID
   (Profile Management Google Sheet)
===================================================== */
// router.get("/employee/:employeeId", async (req, res) => {
//   try {
//     const { employeeId } = req.params;

//     if (!employeeId) {
//       return res.status(400).json({
//         success: false,
//         message: "Employee ID required"
//       });
//     }

//     const r = await axios.post(process.env.PROFILE_SHEET_API, {
//       action: "getProfileByEmployeeId",
//       employeeId
//     });

//     return res.json(r.data);
//   } catch (err) {
//     console.error("Profile fetch error:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Profile fetch failed"
//     });
//   }
// });

// module.exports = router;

router.get("/employee/:employeeId", async (req, res) => {
  try {
    const r = await axios.post(process.env.PROFILE_SHEET_API, {
      action: "getProfileByEmployeeId",
      employeeId: req.params.employeeId
    });

    return res.json(r.data);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ success: false });
  }
});

module.exports = router;