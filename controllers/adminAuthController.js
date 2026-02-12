const axios = require("axios");
const jwt = require("jsonwebtoken");
const sendOtp = require("../utils/sendOtp");

/* ========== ADMIN LOGIN ========== */
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const r = await axios.post(process.env.SHEET_API, {
      action: "adminLogin",
      email,
      password,
    });

    if (!r.data.success) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ success: false });
  }
};

/* ========== SEND OTP ========== */
exports.sendAdminOtp = async (req, res) => {
  const { email } = req.body;

  try {
    console.log("📨 Incoming email:", email);

    const r = await axios.post(process.env.SHEET_API, {
      action: "sendAdminOtp",
      email,
    });

    console.log("📄 Sheet Response:", r.data);

    if (!r.data.success) {
      return res.status(400).json({ success: false });
    }

    console.log("📧 Sending OTP via Brevo SMTP...");
    await sendOtp(email, r.data.otp);

    res.json({ success: true });
  } catch (err) {
    console.error("🔥 SEND ADMIN OTP ERROR:", err.message);
    res.status(500).json({ success: false });
  }
};

/* ========== RESET PASSWORD ========== */
exports.resetAdminPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    const r = await axios.post(process.env.SHEET_API, {
      action: "resetAdminPassword",
      email,
      otp,
      newPassword: password,
    });

    res.json({ success: r.data.success });
  } catch (err) {
    console.error("Reset Error:", err.message);
    res.status(500).json({ success: false });
  }
};

// const axios = require("axios");
// const jwt = require("jsonwebtoken");
// const sendOtp = require("../utils/sendOtp");

// /* ========== LOGIN ========== */
// exports.adminLogin = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const r = await axios.post(process.env.SHEET_API, {
//       action: "adminLogin",
//       email,
//       password
//     });

//     if (!r.data.success) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid email or password"
//       });
//     }

//     const token = jwt.sign(
//       { email, role: "admin" },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({ success: true, token });
//   } catch (err) {
//     console.error("Login Error:", err.message);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };

// exports.sendAdminOtp = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const r = await axios.post(process.env.SHEET_API, {
//       action: "sendAdminOtp",
//       email,
//     });

//     if (!r.data.success) {
//       return res.status(400).json({ success: false });
//     }

//     await sendOtp(email, r.data.otp);
//     res.json({ success: true });

//   } catch (err) {
//     console.error("SEND OTP ERROR:", err.message);
//     res.status(500).json({ success: false });
//   }
// };


// // exports.sendAdminOtp = async (req, res) => {
// //   const { email } = req.body;

// //   try {
// //     console.log("📨 Incoming email:", email);
// //     console.log("📡 Calling SHEET_API:", process.env.SHEET_API);

// //     const r = await axios.post(process.env.SHEET_API, {
// //       action: "sendAdminOtp",
// //       email
// //     });

// //     console.log("📄 Sheet Response:", r.data);

// //     if (!r.data.success) {
// //       return res.status(400).json({ success: false });
// //     }

// //     console.log("📧 Sending OTP via Brevo...");
// //     await sendOtp(email, r.data.otp);

// //     res.json({ success: true });

// //   } catch (err) {
// //     console.error("🔥 SEND ADMIN OTP ERROR:");
// //     console.error(err.response?.data || err.message || err);
// //     res.status(500).json({ success: false });
// //   }
// // };

// // /* ========== SEND OTP ========== */
// // exports.sendAdminOtp = async (req, res) => {
// //   const { email } = req.body;

// //   try {
// //     const r = await axios.post(process.env.SHEET_API, {
// //       action: "sendAdminOtp",
// //       email
// //     });

// //     if (!r.data.success) {
// //       return res.status(400).json({ success: false });
// //     }

// //     await sendOtp(email, r.data.otp);
// //     res.json({ success: true });
// //   } catch {
// //     res.status(500).json({ success: false });
// //   }
// // };

// /* ========== RESET PASSWORD ========== */
// exports.resetAdminPassword = async (req, res) => {
//   const { email, otp, password } = req.body;

//   try {
//     const r = await axios.post(process.env.SHEET_API, {
//       action: "resetAdminPassword",
//       email,
//       otp,
//       newPassword: password
//     });

//     res.json({ success: r.data.success });
//   } catch {
//     res.status(500).json({ success: false });
//   }
// };
