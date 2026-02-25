const express = require("express");
const router = express.Router();
const axios = require("axios");
const PDFDocument = require("pdfkit");
const path = require("path");

// Font paths – NotoSans supports the ₹ Rupee symbol (U+20B9)
const FONT_REGULAR = path.join(__dirname, "../fonts/NotoSans-Regular.ttf");
const FONT_BOLD = path.join(__dirname, "../fonts/NotoSans-Bold.ttf");
const {
  bulkUploadFinance,
  getPayFixation,
  updatePayFixation,
  deletePayFixation,
  bulkUploadPayFixation,
  getPayrollTemplateData
} = require("../controllers/finance.controller");

const FINANCE_API = process.env.FINANCE_SHEET_API;

/* =====================================================
   HELPER: NUMBER TO WORDS (INDIAN FORMAT)
===================================================== */
function numberToWords(num) {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh " + inWords(n % 100000);
    return "";
  };

  return inWords(num).trim() + " Rupees Only";
}

/* =====================================================
   ✅ DROPDOWNS (FIX FOR SEARCH FILTERS)
   URL: GET /api/finance/dropdowns
===================================================== */
router.get("/dropdowns", async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "getFinanceDropdowns"
    });

    res.json({
      success: true,
      firstNames: r.data.firstNames || [],
      lastNames: r.data.lastNames || [],
      emails: r.data.emails || []
    });
  } catch (err) {
    console.error("Dropdowns Error:", err.message);
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   ✅ SEARCH PAYROLL RECORDS
   URL: POST /api/finance/search
===================================================== */
router.post("/search", async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "searchFinance",
      ...req.body
    });

    res.json({
      success: true,
      list: r.data.list || []
    });
  } catch (err) {
    console.error("Search Error:", err.message);
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   GET MONTH PAYROLL
   URL: POST /api/finance/get
===================================================== */
router.post("/get", async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "getMonthlyFinance",
      ...req.body
    });
    res.json(r.data);
  } catch {
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   CREATE PAYROLL
   URL: POST /api/finance/create
===================================================== */
router.post("/create", async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "createMonthlyFinance",
      ...req.body
    });
    res.json(r.data);
  } catch {
    res.status(500).json({ success: false });
  }
});

/* =====================================================
   HELPER: GENERATE PDF BUFFER
===================================================== */
const generatePayslipPdfBuffer = async (d, month) => {
  return new Promise((resolve, reject) => {
    try {
      const gross = d.netPay ? Number(d.netPay) : (+d.basic + +d.hra + +d.otherAllowance + +d.specialPay + +d.incentive);
      const deductions = +d.tds;
      const netPay = d.grossPay ? Number(d.grossPay) : (gross - deductions);

      const payPeriod = new Date(`${month}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      const doj = d.dateOfJoining ? new Date(d.dateOfJoining).toLocaleDateString("en-IN") : "-";

      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // Register NotoSans fonts so ₹ (U+20B9) renders correctly
      doc.registerFont("NotoSans", FONT_REGULAR);
      doc.registerFont("NotoSans-Bold", FONT_BOLD);

      doc.fontSize(16).font("NotoSans-Bold").text("V Tab Square Private Limited", { align: "center" });
      doc.fontSize(10).font("NotoSans").text("Coimbatore, Tamil Nadu, India", { align: "center" });
      doc.moveDown(1);

      const startX = 40;
      let y = doc.y;

      const row = (label, value) => {
        doc.rect(startX, y, 200, 22).stroke();
        doc.rect(startX + 200, y, 315, 22).stroke();
        doc.fontSize(10).text(label, startX + 5, y + 6);
        doc.text(value, startX + 205, y + 6);
        y += 22;
      };

      row("Employee Name", d.fullName);
      row("Employee ID", d.employeeId);
      row("Email", d.email);
      row("Date of Joining", doj);
      row("Pay Period", payPeriod);
      row("Paid Days", d.paidDays);
      row("LOP Days", d.lopDays || 0);

      y += 10;

      doc.rect(startX, y, 515, 22).stroke();
      doc.font("NotoSans-Bold").text("Earnings", startX, y + 6, { align: "center", width: 515 });
      y += 22;

      const erow = (label, value) => {
        doc.rect(startX, y, 350, 22).stroke();
        doc.rect(startX + 350, y, 165, 22).stroke();
        doc.font("NotoSans").text(label, startX + 5, y + 6);
        doc.text(`\u20B9${value}`, startX + 355, y + 6, { align: "right", width: 150 });
        y += 22;
      };

      erow("Basic", d.basic);
      erow("HRA", d.hra);
      erow("Other Allowance", d.otherAllowance);
      erow("Special Pay", d.specialPay);
      erow("Incentive", d.incentive);

      doc.font("NotoSans-Bold");
      erow("Gross Earnings", gross);

      y += 10;

      doc.rect(startX, y, 515, 22).stroke();
      doc.font("NotoSans-Bold").text("Deductions", startX, y + 6, { align: "center", width: 515 });
      y += 22;

      doc.font("NotoSans");
      erow("TDS", d.tds);

      doc.font("NotoSans-Bold");
      erow("Total Deductions", deductions);

      y += 15;

      doc.fontSize(12).font("NotoSans-Bold").text(`Net Pay: \u20B9${netPay}`, startX, y);
      doc.fontSize(10).font("NotoSans").text(numberToWords(netPay), startX, y + 18);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/* =====================================================
   PAYSLIP PDF
   URL: GET /api/finance/payslip-pdf
===================================================== */
router.get("/payslip-pdf", async (req, res) => {
  try {
    const { email, month } = req.query;

    const r = await axios.post(FINANCE_API, {
      action: "getMonthlyFinance",
      email,
      salaryMonth: month
    });

    if (!r.data.success) return res.status(404).send("Payslip not found");

    const d = r.data.finance;
    const pdfBuffer = await generatePayslipPdfBuffer(d, month);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${d.employeeId}_${month}.pdf`);
    res.end(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("PDF generation failed");
  }
});

/* =====================================================
   SEND PAYSLIP EMAIL
   URL: POST /api/finance/send-payslip-email
===================================================== */
router.post("/send-payslip-email", async (req, res) => {
  try {
    const { email, month, adminEmail } = req.body;

    const r = await axios.post(FINANCE_API, {
      action: "getMonthlyFinance",
      email,
      salaryMonth: month
    });

    if (!r.data.success) {
      return res.status(404).json({ success: false, message: "Payslip not found" });
    }

    const d = r.data.finance;
    const pdfBuffer = await generatePayslipPdfBuffer(d, month);
    const base64Pdf = pdfBuffer.toString("base64");

    const monthStr = new Date(`${month}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const subject = `Payslip for ${monthStr}`;
    const content = `
      <h2>Payslip for ${monthStr}</h2>
      <p>Dear ${d.fullName},</p>
      <p>Please find attached your payslip for the month of ${monthStr}.</p>
      <br />
      <p>Best regards,</p>
      <p>Payroll Admin</p>
    `;

    // Sender must be verified on Brevo, fallback to process.env.EMAIL
    const senderEmail = process.env.EMAIL;
    // AFTER
    // const senderEmail = adminEmail || process.env.EMAIL;

    const emailPayload = {
      sender: {
        name: "Payroll Admin",
        email: senderEmail,
      },
      to: [
        { email: email }
      ],
      cc: [
        { email: "Balamuraleee@gmail.com" },
        { email: "vigneshrajas.vtab@gmail.com" }
      ],
      subject: subject,
      htmlContent: content,
      attachment: [
        {
          content: base64Pdf,
          name: `${d.employeeId}_${month}.pdf`
        }
      ]
    };

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      emailPayload,
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        timeout: 15000,
      }
    );

    res.json({ success: true, message: "Email sent successfully", data: response.data });
  } catch (err) {
    console.error("Email send error:", err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// /* =====================================================
//    UPDATE PAYROLL  ✅ FIX
//    URL: POST /api/finance/update
// ===================================================== */
// router.post("/update", async (req, res) => {
//   try {
//     const r = await axios.post(FINANCE_API, {
//       action: "updateMonthlyFinance",
//       ...req.body
//     });

//     res.json(r.data);
//   } catch (err) {
//     console.error("Update Finance Error:", err.message);
//     res.status(500).json({
//       success: false,
//       message: "Update failed"
//     });
//   }
// });

/* =====================================================
   UPDATE PAYROLL  ✅ FIXED
   URL: POST /api/finance/update
===================================================== */
router.post("/update", async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "updateMonthlyFinance",   // ✅ FIXED
      ...req.body
    });

    res.json(r.data);
  } catch (err) {
    console.error("Update Finance Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Update failed in Google Sheet"
    });
  }
});


/* =====================================================
   BULK UPLOAD FINANCE
   URL: POST /api/finance/bulk-upload
===================================================== */
router.post("/bulk-upload", bulkUploadFinance);

/* ================= PAY FIXATION ROUTES ================= */
router.get("/pay-fixation", getPayFixation);
router.post("/pay-fixation/update", updatePayFixation);
router.post("/pay-fixation/delete", deletePayFixation);
router.post("/pay-fixation/bulk-upload", bulkUploadPayFixation);
router.post("/pay-fixation/validate", require("../controllers/finance.controller").validatePayFixationUpload);

/* ================= EXTERNAL DATA ================= */
router.post("/external-allowances", async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "getExternalAllowances",
      ...req.body
    });
    res.json(r.data);
  } catch (err) {
    console.error("External Allowances Error:", err.message);
    res.status(500).json({ success: false });
  }
});

/* ================= PAYROLL TEMPLATE DATA ================= */
router.get("/payroll-template", getPayrollTemplateData);

module.exports = router;
