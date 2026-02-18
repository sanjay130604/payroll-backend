

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
