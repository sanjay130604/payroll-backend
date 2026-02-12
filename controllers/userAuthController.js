// const axios = require("axios");
// const sendOtp = require("../utils/sendOtp");

// exports.login = async (req, res) => {
//   const r = await axios.post(process.env.SHEET_API, {
//     action: "userLogin",
//     ...req.body
//   });
//   res.json(r.data);
// };

// exports.forgot = async (req, res) => {
//   const r = await axios.post(process.env.SHEET_API, {
//     action: "sendUserOtp",
//     email: req.body.email
//   });

//   if (r.data.success) {
//     await sendOtp(req.body.email, r.data.otp);
//   }
//   res.json(r.data);
// };

// exports.reset = async (req, res) => {
//   const r = await axios.post(process.env.SHEET_API, {
//     action: "resetUserPassword",
//     ...req.body
//   });
//   res.json(r.data);
// };

const axios = require("axios");
const sendOtp = require("../utils/sendOtp");

/* ================= USER LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const r = await axios.post(process.env.SHEET_API, {
      action: "userLogin",
      email: req.body.email,
      password: req.body.password
    });
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ================= USER SEND OTP ================= */
exports.forgot = async (req, res) => {
  try {
    const r = await axios.post(process.env.SHEET_API, {
      action: "sendUserOtp",
      email: req.body.email
    });

    if (r.data.success) {
      await sendOtp(req.body.email, r.data.otp);
    }

    res.json(r.data);
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ================= USER RESET PASSWORD ================= */
exports.reset = async (req, res) => {
  try {
    const r = await axios.post(process.env.SHEET_API, {
      action: "resetUserPassword",
      email: req.body.email,
      otp: req.body.otp,
      newPassword: req.body.password   // ✅ FIXED
    });

    res.json(r.data);
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
