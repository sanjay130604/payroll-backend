const axios = require("axios");

/* ================= GET ALL PROFILES ================= */
exports.getAllProfiles = async (req, res) => {
  try {
    const r = await axios.post(process.env.PROFILE_SHEET_API, {
      action: "getAllProfiles"
    });

    res.json(r.data);
  } catch (e) {
    console.error("Get Profiles Error:", e.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profiles"
    });
  }
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!updates) {
      return res.status(400).json({ success: false, message: "No updates provided" });
    }

    // Helper for word count
    const countWords = (str) => (str || "").trim().split(/\s+/).filter(w => w.length > 0).length;

    // 🛡️ BACKEND VALIDATIONS
    if (updates.dob) {
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(updates.dob)) {
        return res.status(400).json({ success: false, message: "Date of Birth must be DD/MM/YYYY" });
      }
      // Age Check
      const [d, m, y] = updates.dob.split("/").map(Number);
      const dobDate = new Date(y, m - 1, d);
      const today = new Date();
      let age = today.getFullYear() - dobDate.getFullYear();
      if (today.getMonth() < dobDate.getMonth() || (today.getMonth() === dobDate.getMonth() && today.getDate() < dobDate.getDate())) {
        age--;
      }
      if (age < 18) {
        return res.status(400).json({ success: false, message: "Employee must be at least 18 years old" });
      }
    }
    if (updates.phone && !/^\d{10}$/.test(updates.phone)) {
      return res.status(400).json({ success: false, message: "Phone Number must be 10 digits" });
    }
    if (updates["father name"] && countWords(updates["father name"]) < 2) {
      return res.status(400).json({ success: false, message: "Father Name must be at least 2 words" });
    }
    if (updates["mother name"] && countWords(updates["mother name"]) < 2) {
      return res.status(400).json({ success: false, message: "Mother Name must be at least 2 words" });
    }
    if (updates["personal mail id"] && !/@/.test(updates["personal mail id"])) {
      return res.status(400).json({ success: false, message: "Personal Email must be a valid email address" });
    }
    if (updates["bank name"] && countWords(updates["bank name"]) < 2) {
      return res.status(400).json({ success: false, message: "Bank Name must be at least 2 words" });
    }
    if (updates["account number"]) {
      const acc = String(updates["account number"]).trim();
      if (acc.length < 11 || acc.length > 16 || !/^[A-Z0-9]+$/i.test(acc)) {
        return res.status(400).json({ success: false, message: "Account Number must be 11-16 alphanumeric characters" });
      }
    }
    if (updates["pan card"] && !/^[A-Z0-9]{10}$/i.test(updates["pan card"])) {
      return res.status(400).json({ success: false, message: "PAN Card must be 10-digit alphanumeric" });
    }
    if (updates["aadhaar card"] && !/^\d{12}$/.test(updates["aadhaar card"])) {
      return res.status(400).json({ success: false, message: "Aadhaar Card must be 12 digits" });
    }
    if (updates.pincode && !/^\d{6}$/.test(updates.pincode)) {
      return res.status(400).json({ success: false, message: "Pincode must be 6 digits" });
    }

    // Min 3 Chars for Address, City, PF
    if (updates["current address"] && updates["current address"].trim().length < 3) return res.status(400).json({ success: false, message: "Current Address must be at least 3 characters" });
    if (updates["permanent address"] && updates["permanent address"].trim().length < 3) return res.status(400).json({ success: false, message: "Permanent Address must be at least 3 characters" });
    if (updates.city && updates.city.trim().length < 3) return res.status(400).json({ success: false, message: "City must be at least 3 characters" });
    if (updates["pf no"] && String(updates["pf no"]).trim().length < 3) return res.status(400).json({ success: false, message: "PF Number must be at least 3 characters" });

    // 🛡️ REQUIRED FIELDS
    const requiredFields = [
      { key: "gender", label: "Gender" },
      { key: "employee type", label: "Employee Type" },
      { key: "education", label: "Education" },
      { key: "Specialization", label: "Specialization" },
      { key: "country", label: "Country" },
      { key: "state", label: "State" },
      { key: "blood group", label: "Blood Group" }
    ];

    for (const field of requiredFields) {
      if (updates[field.key] !== undefined && (!updates[field.key] || updates[field.key].trim() === "")) {
        return res.status(400).json({ success: false, message: `${field.label} is required` });
      }
    }

    const r = await axios.post(process.env.PROFILE_SHEET_API, {
      action: "updateProfile",
      ...req.body
    });

    res.json(r.data);
  } catch (e) {
    console.error("Update Profile Error:", e.message);
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};

/* ================= BULK UPLOAD PROFILES ================= */
exports.bulkUploadProfiles = async (req, res) => {
  try {
    const { profiles } = req.body;

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No profiles provided"
      });
    }

    // 1. Fetch ALL existing profiles first
    const existingProfilesRes = await axios.post(process.env.PROFILE_SHEET_API, {
      action: "getAllProfiles"
    });

    const existingUsers = existingProfilesRes.data.profiles || [];
    // Assuming structure: validProfiles usually returns array of objects
    // Map existing unique identifiers
    const existingIds = new Set(existingUsers.map(u => (u.employeeId || "").toString().trim()));
    const existingEmails = new Set(existingUsers.map(u => (u.email || "").toString().toLowerCase().trim()));

    const validProfiles = [];
    const skipped = [];

    // 2. Filter duplicates
    profiles.forEach(p => {
      const empId = (p["Employee ID"] || "").toString().trim();
      const email = (p["Company Mail Id"] || "").toString().toLowerCase().trim();

      let isDuplicate = false;
      let reason = "";

      if (empId && existingIds.has(empId)) {
        isDuplicate = true;
        reason = `${empId}: Employee ID already exists`;
      } else if (email && existingEmails.has(email)) {
        isDuplicate = true;
        reason = `${email}: Email already exists`;
      }

      if (isDuplicate) {
        skipped.push(reason);
      } else {
        validProfiles.push(p);
        // Add to local sets to catch duplicates within the same upload file
        if (empId) existingIds.add(empId);
        if (email) existingEmails.add(email);
      }
    });

    // 3. Upload only valid profiles
    if (validProfiles.length > 0) {
      const r = await axios.post(process.env.PROFILE_SHEET_API, {
        action: "bulkUploadProfiles",
        profiles: validProfiles
      });

      if (!r.data.success) {
        return res.status(400).json({
          success: false,
          message: "Failed to upload profiles (Apps Script Error)"
        });
      }
    }

    res.json({
      success: true,
      message: `Checked ${profiles.length} rows. Uploaded ${validProfiles.length} new profiles.`,
      data: {
        uploaded: validProfiles.length,
        skipped: skipped
      }
    });

  } catch (e) {
    console.error("Bulk Upload Profile Error:", e.message);
    res.status(500).json({
      success: false,
      message: "Failed to upload profiles"
    });
  }
};
