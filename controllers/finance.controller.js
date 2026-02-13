const axios = require("axios");

const FINANCE_API = process.env.FINANCE_SHEET_API;

/* ===== GET MONTH ===== */
exports.getMonthlyFinance = async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "getMonthlyFinance",
      ...req.body
    });
    res.json(r.data);
  } catch {
    res.status(500).json({ success: false });
  }
};

/* ===== CREATE MONTH ===== */
exports.createMonthlyFinance = async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "createMonthlyFinance",
      ...req.body
    });
    res.json(r.data);
  } catch {
    res.status(500).json({ success: false });
  }
};

/* ===== UPDATE ===== */
exports.updateMonthlyFinance = async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "updateMonthlyFinance",
      ...req.body
    });
    res.json(r.data);
  } catch {
    res.status(500).json({ success: false });
  }
};

/* ===== BULK UPLOAD FINANCE ===== */
exports.bulkUploadFinance = async (req, res) => {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No finance data provided"
      });
    }

    // Proxy the request to Apps Script - let Apps Script handle validation and storage
    const r = await axios.post(FINANCE_API, {
      action: "bulkUploadFinance",
      rows: rows
    });

    if (r.data.success) {
      res.json({
        success: true,
        message: r.data.message || "Bulk upload completed",
        data: r.data.data // contains inserted, updated, skipped (with reasons)
      });
    } else {
      res.status(400).json({
        success: false,
        message: r.data.message || "Bulk upload failed"
      });
    }

  } catch (e) {
    console.error("Bulk Upload Finance Error:", e.message);
    res.status(500).json({
      success: false,
      message: "Failed to upload finance data"
    });
  }
};

/* ===== GET ALL PAY FIXATION ===== */
exports.getPayFixation = async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "getPayFixation"
    });
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===== UPDATE PAY FIXATION ===== */
exports.updatePayFixation = async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "updatePayFixation",
      ...req.body
    });
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===== DELETE PAY FIXATION DATA ===== */
exports.deletePayFixation = async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "deletePayFixation",
      ...req.body
    });
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ===== BULK UPLOAD PAY FIXATION ===== */
exports.bulkUploadPayFixation = async (req, res) => {
  try {
    const r = await axios.post(FINANCE_API, {
      action: "bulkUploadPayFixation",
      ...req.body
    });
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
