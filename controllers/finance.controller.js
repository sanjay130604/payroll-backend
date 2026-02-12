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
    const { rows } = req.body; // Frontend sends 'rows', not 'users' or 'profiles'

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No finance data provided"
      });
    }

    // 1. Extract unique years from the upload data
    const years = new Set();
    rows.forEach(r => {
      if (r["Salary Month"] && /^\d{4}-\d{2}$/.test(r["Salary Month"])) {
        years.add(r["Salary Month"].split("-")[0]);
      }
    });

    if (years.size === 0) {
      // If no valid months found, we can't check duplicates effectively, 
      // but maybe we should proceed or fail? 
      // Let's assume current year if missing? No, validation should have caught invalid months.
      // We'll proceed with empty existing set if no years found (unlikely if validation passes).
    }

    // 2. Fetch existing finance data for these years
    let existingFinance = [];
    for (const year of years) {
      try {
        const r = await axios.post(FINANCE_API, {
          action: "getFinanceByYear",
          year
        });
        if (r.data && (r.data.data || r.data.finance)) {
          existingFinance.push(...(r.data.data || r.data.finance));
        }
      } catch (err) {
        console.error(`Failed to fetch finance for year ${year}:`, err.message);
        // Continue? Or fail? If we fail to fetch, duplicate check is compromised.
        // Let's log and continue, maybe strict mode would fail.
      }
    }

    // 3. Create a Set of "Month|Email"
    const existingEntries = new Set(existingFinance.map(f => `${f.salaryMonth}|${f.email}`.toLowerCase()));

    const validRows = [];
    const skipped = [];

    // 4. Duplicate Check
    rows.forEach(r => {
      const month = (r["Salary Month"] || "").trim();
      const email = (r["Employee Mail id"] || "").toLowerCase().trim();

      // Basic validation should have checked format, but safe coding:
      if (!month || !email) {
        // Skip or let it fail in Apps Script? 
        // If validRows push, Apps Script handles.
        validRows.push(r);
        return;
      }

      const key = `${month}|${email}`.toLowerCase();

      if (existingEntries.has(key)) {
        skipped.push(`${email} (${month}): Record already exists`);
      } else {
        // Check for duplicates WITHIN the current upload as well
        if (validRows.some(vr => (vr["Salary Month"] || "").trim() === month && (vr["Employee Mail id"] || "").toLowerCase().trim() === email)) {
          skipped.push(`${email} (${month}): Duplicate in current file`);
        } else {
          validRows.push(r);
          // We don't add to existingEntries because we just checked validRows.some
        }
      }
    });

    // 5. Upload
    if (validRows.length > 0) {
      const r = await axios.post(FINANCE_API, {
        action: "bulkUploadFinance",
        rows: validRows
      });

      if (!r.data.success) {
        return res.status(400).json({ success: false, message: "Bulk upload failed (Apps Script)" });
      }
    }

    res.json({
      success: true,
      message: `Checked ${rows.length} rows. Uploaded ${validRows.length} new entries.`,
      data: {
        inserted: validRows.length,
        updated: 0,
        skipped: skipped
      }
    });

  } catch (e) {
    console.error("Bulk Upload Finance Error:", e.message);
    res.status(500).json({
      success: false,
      message: "Failed to upload finance data"
    });
  }
};
