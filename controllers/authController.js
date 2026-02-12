// // // // // // // // const bcrypt = require("bcryptjs");
// // // // // // // // const User = require("../models/User");
// // // // // // // // const sendOtp = require("../utils/sendOtp");

// // // // // // // // exports.register = async (req, res) => {
// // // // // // // //   const { email, password } = req.body;

// // // // // // // //   if (!email || !password)
// // // // // // // //     return res.status(400).json({ message: "All fields required" });

// // // // // // // //   const exists = await User.findOne({ email });
// // // // // // // //   if (exists) return res.status(409).json({ message: "User exists" });

// // // // // // // //   const hashed = await bcrypt.hash(password, 10);
// // // // // // // //   await User.create({ email, password: hashed });

// // // // // // // //   res.json({ message: "User created" });
// // // // // // // // };

// // // // // // // // exports.login = async (req, res) => {
// // // // // // // //   const { email, password } = req.body;

// // // // // // // //   const user = await User.findOne({ email });
// // // // // // // //   if (!user) return res.status(400).json({ message: "Invalid email" });

// // // // // // // //   const match = await bcrypt.compare(password, user.password);
// // // // // // // //   if (!match) return res.status(400).json({ message: "Invalid password" });

// // // // // // // //   res.json({ message: "Login success" });
// // // // // // // // };

// // // // // // // // exports.forgotPassword = async (req, res) => {
// // // // // // // //   const otp = Math.floor(100000 + Math.random() * 900000).toString();

// // // // // // // //   const user = await User.findOne({ email: req.body.email });
// // // // // // // //   user.otp = otp;
// // // // // // // //   user.otpExpiry = Date.now() + 10 * 60 * 1000;
// // // // // // // //   await user.save();

// // // // // // // //   await sendOtp(user.email, otp);
// // // // // // // //   res.json({ message: "OTP sent" });
// // // // // // // // };

// // // // // // // // exports.resetPassword = async (req, res) => {
// // // // // // // //   const user = await User.findOne({ email: req.body.email, otp: req.body.otp });

// // // // // // // //   if (!user || user.otpExpiry < Date.now())
// // // // // // // //     return res.status(400).json({ message: "Invalid OTP" });

// // // // // // // //   user.password = await bcrypt.hash(req.body.password, 10);
// // // // // // // //   user.otp = null;
// // // // // // // //   user.otpExpiry = null;
// // // // // // // //   await user.save();

// // // // // // // //   res.json({ message: "Password reset success" });
// // // // // // // // };

// // // // // // // const axios = require("axios");

// // // // // // // /**
// // // // // // //  * USER LOGIN (Google Sheet)
// // // // // // //  */
// // // // // // // exports.login = async (req, res) => {
// // // // // // //   try {
// // // // // // //     const { email, password } = req.body;

// // // // // // //     const r = await axios.post(process.env.SHEET_API, {
// // // // // // //       action: "login",
// // // // // // //       email,
// // // // // // //       password
// // // // // // //     });

// // // // // // //     if (r.data.success) {
// // // // // // //       return res.json({
// // // // // // //         success: true,
// // // // // // //         email: r.data.email
// // // // // // //       });
// // // // // // //     }

// // // // // // //     return res.status(401).json({
// // // // // // //       success: false,
// // // // // // //       message: "Invalid credentials"
// // // // // // //     });

// // // // // // //   } catch (err) {
// // // // // // //     return res.status(500).json({
// // // // // // //       success: false,
// // // // // // //       message: "Server error"
// // // // // // //     });
// // // // // // //   }
// // // // // // // };


// // // // // // const axios = require("axios");

// // // // // // /**
// // // // // //  * USER LOGIN (Google Sheet)
// // // // // //  * USED ONLY FOR AUTHENTICATION
// // // // // //  */
// // // // // // exports.login = async (req, res) => {
// // // // // //   try {
// // // // // //     const { email, password } = req.body;

// // // // // //     const r = await axios.post(process.env.SHEET_API, {
// // // // // //       action: "login",
// // // // // //       email,
// // // // // //       password
// // // // // //     });

// // // // // //     if (r.data.success) {
// // // // // //       // ✅ CRITICAL FIX: return success + email
// // // // // //       return res.json({
// // // // // //         success: true,
// // // // // //         email: r.data.email
// // // // // //       });
// // // // // //     }

// // // // // //     return res.status(401).json({
// // // // // //       success: false,
// // // // // //       message: "Invalid credentials"
// // // // // //     });

// // // // // //   } catch (err) {
// // // // // //     console.error("LOGIN ERROR:", err.message);
// // // // // //     return res.status(500).json({
// // // // // //       success: false,
// // // // // //       message: "Server error"
// // // // // //     });
// // // // // //   }
// // // // // // };

// // // // // const axios = require("axios");

// // // // // /* ================= USER LOGIN ================= */
// // // // // exports.login = async (req, res) => {
// // // // //   try {
// // // // //     const { email, password } = req.body;

// // // // //     const r = await axios.post(process.env.SHEET_API, {
// // // // //       action: "login",
// // // // //       email,
// // // // //       password
// // // // //     });

// // // // //     if (r.data.success) {
// // // // //       return res.json({
// // // // //         success: true,
// // // // //         email: r.data.email
// // // // //       });
// // // // //     }

// // // // //     return res.status(401).json({
// // // // //       success: false,
// // // // //       message: "Invalid credentials"
// // // // //     });

// // // // //   } catch (err) {
// // // // //     console.error("LOGIN ERROR:", err.message);
// // // // //     return res.status(500).json({
// // // // //       success: false,
// // // // //       message: "Server error"
// // // // //     });
// // // // //   }
// // // // // };

// // // // // /* ================= FORGOT PASSWORD (PLACEHOLDER) ================= */
// // // // // exports.forgot = async (req, res) => {
// // // // //   return res.json({
// // // // //     success: true,
// // // // //     message: "Forgot password feature coming soon"
// // // // //   });
// // // // // };

// // // // // /* ================= RESET PASSWORD (PLACEHOLDER) ================= */
// // // // // exports.reset = async (req, res) => {
// // // // //   return res.json({
// // // // //     success: true,
// // // // //     message: "Reset password feature coming soon"
// // // // //   });
// // // // // };


// // // // const axios = require("axios");
// // // // const sendOtpMail = require("../utils/sendOtp");

// // // // /* ================= LOGIN ================= */
// // // // exports.login = async (req, res) => {
// // // //   try {
// // // //     const { email, password } = req.body;

// // // //     const r = await axios.post(process.env.SHEET_API, {
// // // //       action: "login",
// // // //       email,
// // // //       password
// // // //     });

// // // //     if (r.data.success) {
// // // //       return res.json({ success: true, email: r.data.email });
// // // //     }

// // // //     return res.status(401).json({
// // // //       success: false,
// // // //       message: "Invalid credentials"
// // // //     });
// // // //   } catch {
// // // //     return res.status(500).json({ success: false, message: "Server error" });
// // // //   }
// // // // };

// // // // /* ================= SEND OTP ================= */
// // // // exports.forgot = async (req, res) => {
// // // //   try {
// // // //     const { email } = req.body;

// // // //     const r = await axios.post(process.env.SHEET_API, {
// // // //       action: "sendUserOtp",
// // // //       email
// // // //     });

// // // //     if (!r.data.success) {
// // // //       return res.status(404).json({ success: false, message: "Email not found" });
// // // //     }

// // // //     // OPTIONAL: send mail from Node instead of GAS
// // // //     if (r.data.otp) {
// // // //       await sendOtpMail(email, r.data.otp);
// // // //     }

// // // //     res.json({ success: true });
// // // //   } catch {
// // // //     res.status(500).json({ success: false, message: "OTP send failed" });
// // // //   }
// // // // };

// // // // /* ================= RESET PASSWORD ================= */
// // // // exports.reset = async (req, res) => {
// // // //   try {
// // // //     const { email, otp, password } = req.body;

// // // //     const r = await axios.post(process.env.SHEET_API, {
// // // //       action: "resetUserPassword",
// // // //       email,
// // // //       otp,
// // // //       newPassword: password
// // // //     });

// // // //     if (r.data.success) {
// // // //       return res.json({ success: true });
// // // //     }

// // // //     res.status(400).json({ success: false, message: "Invalid OTP" });
// // // //   } catch {
// // // //     res.status(500).json({ success: false, message: "Reset failed" });
// // // //   }
// // // // };

// // // const axios = require("axios");

// // // /* ================= LOGIN ================= */
// // // exports.login = async (req, res) => {
// // //   try {
// // //     const { email, password } = req.body;

// // //     const r = await axios.post(process.env.SHEET_API, {
// // //       action: "login",
// // //       email,
// // //       password
// // //     });

// // //     if (r.data.success) {
// // //       return res.json({ success: true, email: r.data.email });
// // //     }

// // //     res.status(401).json({ success: false, message: "Invalid credentials" });
// // //   } catch {
// // //     res.status(500).json({ success: false, message: "Server error" });
// // //   }
// // // };

// // // /* ================= SEND OTP ================= */
// // // exports.forgot = async (req, res) => {
// // //   try {
// // //     const { email } = req.body;

// // //     const r = await axios.post(process.env.SHEET_API, {
// // //       action: "sendUserOtp",
// // //       email
// // //     });

// // //     if (r.data.success) {
// // //       return res.json({ success: true });
// // //     }

// // //     res.status(404).json({ success: false, message: "Email not found" });
// // //   } catch {
// // //     res.status(500).json({ success: false, message: "OTP send failed" });
// // //   }
// // // };

// // // /* ================= RESET PASSWORD ================= */
// // // exports.reset = async (req, res) => {
// // //   try {
// // //     const { email, otp, password } = req.body;

// // //     const r = await axios.post(process.env.SHEET_API, {
// // //       action: "resetUserPassword",
// // //       email,
// // //       otp,
// // //       newPassword: password
// // //     });

// // //     if (r.data.success) {
// // //       return res.json({ success: true });
// // //     }

// // //     res.status(400).json({ success: false, message: "Invalid OTP" });
// // //   } catch {
// // //     res.status(500).json({ success: false, message: "Reset failed" });
// // //   }
// // // };

// // const axios = require("axios");

// // /* ================= LOGIN ================= */
// // exports.login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     const r = await axios.post(process.env.SHEET_API, {
// //       action: "login",
// //       email,
// //       password
// //     });

// //     if (r.data.success) {
// //       return res.json({ success: true, email: r.data.email });
// //     }

// //     return res.status(401).json({ success: false, message: "Invalid credentials" });
// //   } catch (err) {
// //     return res.status(500).json({ success: false, message: "Server error" });
// //   }
// // };

// // /* ================= FORGOT PASSWORD ================= */
// // exports.forgot = async (req, res) => {
// //   try {
// //     const { email } = req.body;

// //     const r = await axios.post(process.env.SHEET_API, {
// //       action: "sendUserOtp",
// //       email
// //     });

// //     if (r.data.success) {
// //       return res.json({ success: true });
// //     }

// //     return res.status(404).json({ success: false, message: "Email not found" });
// //   } catch (err) {
// //     return res.status(500).json({ success: false, message: "OTP send failed" });
// //   }
// // };

// // /* ================= RESET PASSWORD ================= */
// // exports.reset = async (req, res) => {
// //   try {
// //     const { email, otp, password } = req.body;

// //     const r = await axios.post(process.env.SHEET_API, {
// //       action: "resetUserPassword",
// //       email,
// //       otp,
// //       newPassword: password
// //     });

// //     if (r.data.success) {
// //       return res.json({ success: true });
// //     }

// //     return res.status(400).json({ success: false, message: "Invalid OTP" });
// //   } catch (err) {
// //     return res.status(500).json({ success: false, message: "Reset failed" });
// //   }
// // };

// const axios = require("axios");
// const sendOtp = require("../utils/sendOtp");

// /* =====================================================
//    USER LOGIN
// ===================================================== */
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const r = await axios.post(process.env.SHEET_API, {
//       action: "login",
//       email,
//       password
//     });

//     if (!r.data.success) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials"
//       });
//     }

//     return res.json({
//       success: true,
//       email: r.data.email
//     });

//   } catch (err) {
//     console.error("User login error:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Server error"
//     });
//   }
// };

// /* =====================================================
//    USER FORGOT PASSWORD (SEND OTP)
// ===================================================== */
// exports.forgot = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const r = await axios.post(process.env.SHEET_API, {
//       action: "sendUserOtp",
//       email
//     });

//     if (!r.data.success) {
//       return res.status(404).json({
//         success: false,
//         message: "Email not found"
//       });
//     }

//     // ✅ OTP GENERATED BY GOOGLE SHEET
//     // ✅ EMAIL SENT BY NODE (LIKE ADMIN)
//     await sendOtp(email, r.data.otp);

//     return res.json({
//       success: true
//     });

//   } catch (err) {
//     console.error("User forgot error:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "OTP send failed"
//     });
//   }
// };

// /* =====================================================
//    USER RESET PASSWORD
// ===================================================== */
// exports.reset = async (req, res) => {
//   try {
//     const { email, otp, password } = req.body;

//     const r = await axios.post(process.env.SHEET_API, {
//       action: "resetUserPassword",
//       email,
//       otp,
//       newPassword: password
//     });

//     if (!r.data.success) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP"
//       });
//     }

//     return res.json({
//       success: true
//     });

//   } catch (err) {
//     console.error("User reset error:", err.message);
//     return res.status(500).json({
//       success: false,
//       message: "Reset failed"
//     });
//   }
// };

const axios = require("axios");
const sendOtp = require("../utils/sendOtp");

/* =====================================================
   USER LOGIN
===================================================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const r = await axios.post(process.env.SHEET_API, {
      action: "userLogin",   // ✅ FIXED
      email,
      password
    });

    if (!r.data.success) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    return res.json({
      success: true,
      email
    });

  } catch (err) {
    console.error("User login error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* =====================================================
   USER FORGOT PASSWORD (SEND OTP)
===================================================== */
exports.forgot = async (req, res) => {
  try {
    const { email } = req.body;

    const r = await axios.post(process.env.SHEET_API, {
      action: "sendUserOtp",
      email
    });

    if (!r.data.success) {
      return res.status(404).json({
        success: false,
        message: "Email not found"
      });
    }

    // ✅ Send OTP via email (Node handles email)
    await sendOtp(email, r.data.otp);

    return res.json({
      success: true
    });

  } catch (err) {
    console.error("User forgot error:", err.message);
    return res.status(500).json({
      success: false,
      message: "OTP send failed"
    });
  }
};

/* =====================================================
   USER RESET PASSWORD
===================================================== */
exports.reset = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const r = await axios.post(process.env.SHEET_API, {
      action: "resetUserPassword",
      email,
      otp,
      newPassword: password
    });

    if (!r.data.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    return res.json({
      success: true
    });

  } catch (err) {
    console.error("User reset error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Reset failed"
    });
  }
};
