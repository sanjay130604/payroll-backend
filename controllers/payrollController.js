const axios = require("axios");
const PDFDocument = require("pdfkit");
const { sheetRequest } = require("../utils/sheetRequest");

/**
 * GET PAYROLL BY EMAIL (USER ONLY)
 * Source: Google Sheets (user details tab)
 */
exports.getPayrollByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const data = await sheetRequest(process.env.SHEET_API, {
      action: "getPayrollByEmail",
      email
    });

    return res.json(data);

  } catch (err) {
    console.error("Payroll fetch error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Payroll fetch failed"
    });
  }
};

exports.updatePayrollByEmail = async (req, res) => {
  try {
    const data = await sheetRequest(process.env.SHEET_API, {
      action: "updatePayrollByEmail",
      ...req.body
    });

    return res.json(data);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Update failed"
    });
  }
};
exports.updatePayroll = async (req, res) => {
  try {
    const r = await axios.post(process.env.SHEET_API, {
      action: "updatePayrollByEmail",
      ...req.body
    });

    res.json({ success: r.data.success });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.getSalaryHistoryByEmail = async (req, res) => {
  try {
    const { email, year, month } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required"
      });
    }

    const data = await sheetRequest(process.env.FINANCE_SHEET_API, {
      action: "getSalaryHistory",
      email,
      year,
      month
    });

    return res.json(data);

  } catch (err) {
    console.error("Salary history error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Salary history fetch failed"
    });
  }
};




exports.generateSalaryPDF = async (req, res) => {
  try {
    const { email, months } = req.body;

    if (!email || !months || months.length === 0) {
      return res.status(400).json({
        message: "Email & months required"
      });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=salary_history.pdf"
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // ================= HEADER =================
    // Add a simple logo placeholder or color strip
    doc.rect(0, 0, 600, 20).fill("#4F46E5"); // Indigo top strip

    doc.moveDown(2);
    doc.font('Helvetica-Bold').fontSize(24).fillColor("#1F2937").text("Salary History Report", { align: "center" });
    doc.moveDown(0.5);

    // Employee Info Box
    const startY = doc.y;
    doc.rect(50, startY, 495, 70).lineWidth(1).strokeColor("#E5E7EB").stroke();

    doc.fontSize(10).fillColor("#6B7280").text("EMPLOYEE DETAILS", 70, startY + 10);
    doc.fontSize(12).fillColor("#111827").font('Helvetica-Bold');

    doc.text(`Email: ${email}`, 70, startY + 30);

    const firstRecord = months[0];
    if (firstRecord.firstName) {
      doc.text(`Name: ${firstRecord.firstName} ${firstRecord.lastName || ""}`, 70, startY + 45);
    }
    if (firstRecord.employeeId) {
      doc.text(`ID: ${firstRecord.employeeId}`, 350, startY + 45);
    }

    doc.moveDown(4);

    // ================= MONTH RECORDS =================
    let y = doc.y;

    months.forEach((m, index) => {
      // Check for page break
      if (y > 650) {
        doc.addPage();
        y = 50;
      }

      const boxTop = y;

      // --- Month Header ---
      doc.roundedRect(50, y, 495, 30, 5).fill("#EEF2FF"); // Light Indigo bg
      doc.fillColor("#4338CA").font('Helvetica-Bold').fontSize(14).text(m.month, 70, y + 8);

      // Status/Date
      doc.fontSize(10).fillColor("#6B7280").text(`Generated: ${m.date || '-'}`, 350, y + 10, { align: 'right', width: 175 });

      y += 30;

      // --- Info Row ---
      doc.rect(50, y, 495, 25).strokeColor("#E5E7EB").stroke();
      doc.font('Helvetica').fontSize(9).fillColor("#374151");

      let infoX = 70;
      doc.text("Working Days:", infoX, y + 8);
      doc.font('Helvetica-Bold').text(m.workingDays || 0, infoX + 70, y + 8);

      infoX += 130;
      doc.font('Helvetica').text("LOP Days:", infoX, y + 8);
      doc.font('Helvetica-Bold').text(m.lopDays || 0, infoX + 50, y + 8);

      infoX += 130;
      doc.font('Helvetica').text("Total Leaves:", infoX, y + 8);
      doc.font('Helvetica-Bold').text(m.totalLeaves || 0, infoX + 65, y + 8);

      y += 25;

      // --- TABLE HEADERS ---
      doc.rect(50, y, 495, 20).fill("#F9FAFB");
      doc.rect(50, y, 495, 20).strokeColor("#E5E7EB").stroke(); // Border

      doc.font('Helvetica-Bold').fontSize(9).fillColor("#111827");
      doc.text("EARNINGS", 70, y + 6);
      doc.text("AMOUNT", 220, y + 6, { align: "right", width: 60 });
      doc.text("DEDUCTIONS", 320, y + 6);
      doc.text("AMOUNT", 470, y + 6, { align: "right", width: 60 });

      y += 20;

      // --- ITEMS ---
      const earnings = [
        { label: "Basic Salary", value: m.salary || 0 },
        { label: "HRA", value: m.hra || 0 },
        { label: "Other Allow.", value: m.otherAllowance || 0 },
        { label: "Special Pay", value: m.specialPay || 0 },
        { label: "Incentives", value: m.incentive || 0 },
      ];

      const deductions = [
        { label: "TDS", value: m.tds || 0 },
        { label: "Other Ded.", value: m.otherDeductions || 0 },
      ];

      const maxRows = Math.max(earnings.length, deductions.length);

      doc.font('Helvetica').fontSize(9).fillColor("#374151");

      for (let i = 0; i < maxRows; i++) {
        // Row Border
        doc.rect(50, y, 495, 20).strokeColor("#F3F4F6").stroke();

        // Earnings
        if (earnings[i]) {
          const val = Number(earnings[i].value);
          if (val > 0) {
            doc.text(earnings[i].label, 70, y + 6);
            doc.text(val.toLocaleString("en-IN"), 220, y + 6, { align: "right", width: 60 });
          }
        }

        // Deductions
        if (deductions[i]) {
          const val = Number(deductions[i].value);
          if (val > 0) {
            doc.text(deductions[i].label, 320, y + 6);
            doc.text(val.toLocaleString("en-IN"), 470, y + 6, { align: "right", width: 60 });
          }
        }

        // Vertical Line Split
        doc.moveTo(297, y).lineTo(297, y + 20).strokeColor("#E5E7EB").stroke();

        y += 20;
      }

      // --- TOTALS ROW ---
      const totalEarnings = earnings.reduce((acc, cur) => acc + Number(cur.value), 0);
      const totalDeductions = deductions.reduce((acc, cur) => acc + Number(cur.value), 0);
      const netPay = totalEarnings - totalDeductions;

      doc.rect(50, y, 495, 30).fill("#F3F4F6"); // Footer bg
      doc.rect(50, y, 495, 30).strokeColor("#E5E7EB").stroke(); // Border

      doc.font('Helvetica-Bold').fontSize(10).fillColor("#111827");

      doc.text("Total Earnings:", 70, y + 10);
      doc.text(totalEarnings.toLocaleString("en-IN"), 220, y + 10, { align: "right", width: 60 });

      doc.text("Net Pay:", 320, y + 10);
      doc.fontSize(12).fillColor("#4338CA").text(`Rs. ${netPay.toLocaleString("en-IN")}`, 400, y + 9, { align: "right", width: 130 });

      y += 50; // Spacing for next month
    });

    // Footer
    doc.fontSize(8).fillColor("#9CA3AF").text("This is a system-generated report.", 50, 750, { align: "center" });

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({
      message: "PDF generation failed"
    });
  }
};

/* ================= GET PAYROLL BY EMPLOYEE ID ================= */
exports.getPayrollByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.query;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID required"
      });
    }

    const data = await sheetRequest(process.env.FINANCE_SHEET_API, {
      action: "getFinanceByEmployeeId",
      employeeId
    });

    return res.json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Payroll fetch failed"
    });
  }
};

/* ================= GET ATTENDANCE OVERVIEW ================= */
exports.getAttendanceByEmployeeId = async (req, res) => {
  try {
    const { employeeId, email } = req.query;

    if (!employeeId && !email) {
      return res.status(400).json({
        success: false,
        message: "Employee ID or Email required"
      });
    }

    const data = await sheetRequest(process.env.FINANCE_SHEET_API, {
      action: "getAttendanceOverview",
      employeeId,
      email
    });

    return res.json(data);

  } catch (err) {
    console.error("Attendance fetch error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Attendance fetch failed"
    });
  }
};
