const axios = require("axios");

/* ================= CREATE USER ================= */
exports.createUser = async (req, res) => {
  const { firstName, lastName, employeeId, email, password, confirmPassword } = req.body;

  // 1. All fields required
  if (!firstName || !lastName || !employeeId || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  // 1.5 Employee ID validation (Starts with VTAB)
  if (!employeeId.trim().toUpperCase().startsWith("VTAB")) {
    return res.status(400).json({ success: false, message: "Employee ID must start with 'VTAB' (e.g., VTAB001)" });
  }

  // 2. Name length validation
  if (firstName.trim().length < 2) {
    return res.status(400).json({ success: false, message: "First Name must be at least 2 characters" });
  }
  if (lastName.trim().length < 1) {
    return res.status(400).json({ success: false, message: "Last Name must be at least 1 character" });
  }

  // 3. Email validation (@gmail.com only)
  if (!email.includes("@")) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }

  // 4. Password validation (more than 4 letters -> at least 5)
  if (password.length < 5) {
    return res.status(400).json({ success: false, message: "Password must be at least 5 characters long" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match"
    });
  }

  try {
    const r = await axios.post(process.env.SHEET_API, {
      action: "createUser",
      firstName,
      lastName,
      employeeId,
      email,
      password
    });

    if (!r.data.success) {
      return res.status(400).json({
        success: false,
        message: r.data.message || "User already exists"
      });
    }

    return res.json({
      success: true,
      message: "User created successfully"
    });

  } catch (err) {
    console.error("Create User Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= GET ALL USERS ================= */
exports.getAllUsers = async (req, res) => {
  try {
    const r = await axios.post(process.env.SHEET_API, {
      action: "getAllUsers"
    });

    return res.json(r.data);

  } catch (err) {
    console.error("Get Users Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= UPDATE USER ================= */
exports.updateUser = async (req, res) => {
  const { firstName, lastName, email, newPassword } = req.body;

  // 1. Required fields (check if they exist and are not just empty strings)
  if (firstName !== undefined && firstName.trim().length < 2) {
    return res.status(400).json({ success: false, message: "First Name must be at least 2 characters" });
  }
  if (lastName !== undefined && lastName.trim().length < 1) {
    return res.status(400).json({ success: false, message: "Last Name must be at least 1 character" });
  }

  // 2. Email domain check
  if (email && !email.includes("@")) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }

  // 3. Password length check (if provided)
  if (newPassword && newPassword.length < 5) {
    return res.status(400).json({ success: false, message: "New password must be at least 5 characters long" });
  }

  try {
    const r = await axios.post(process.env.SHEET_API, {
      action: "updateUser",
      ...req.body
    });

    return res.json(r.data);

  } catch (err) {
    console.error("Update User Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= DELETE USER ================= */
exports.deleteUser = async (req, res) => {
  const { row } = req.body;

  if (!row) {
    return res.status(400).json({
      success: false,
      message: "Row number required"
    });
  }

  try {
    const r = await axios.post(process.env.SHEET_API, {
      action: "deleteUser",
      row
    });

    return res.json(r.data);

  } catch (err) {
    console.error("Delete User Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* ================= BULK UPLOAD USERS ================= */
exports.bulkUploadUsers = async (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Users array required"
    });
  }

  // 🔥 ROBUST FIX: Add aliases to handle common naming variations/typos in Google Sheet
  const augmentedUsers = users.map(u => {
    const newUser = { ...u };

    // Helper to add alias if value exists
    const addAlias = (key, aliases) => {
      if (u[key]) {
        aliases.forEach(a => newUser[a] = u[key]);
      }
    };

    // 1. FIRST NAME variations
    const fName = u["First Name"] || u["first name"] || u["Firstname"];
    if (fName) {
      newUser["First Name"] = fName;
      newUser["Frist Name"] = fName;
      newUser["Firstname"] = fName;
      newUser["Name"] = fName;
    }

    // 2. LAST NAME variations
    const lName = u["Last Name"] || u["last name"] || u["Lastname"];
    if (lName) {
      newUser["Last Name"] = lName;
      newUser["Lastname"] = lName;
    }

    // 3. EMAIL variations
    const email = u["Email ID"] || u["Email"] || u["email"] || u["Email Address"];
    if (email) {
      newUser["Email ID"] = email;
      newUser["Email"] = email;
      newUser["Email Address"] = email;
      newUser["Employee Email"] = email;
    }

    // 4. EMPLOYEE ID variations
    const empId = u["Employee ID"] || u["employee id"] || u["ID"];
    if (empId) {
      newUser["Employee ID"] = empId;
      newUser["Emp ID"] = empId;
    }

    return newUser;
  });

  try {
    // 1. Fetch ALL existing users first to check for duplicates
    // We do this in Node.js since we cannot modify the Apps Script easily.
    const existingUsersRes = await axios.post(process.env.SHEET_API, {
      action: "getAllUsers"
    });

    const existingUsers = existingUsersRes.data.users || [];
    const existingEmails = new Set(existingUsers.map(u => (u.email || "").toLowerCase().trim()));
    const existingIds = new Set(existingUsers.map(u => (u.employeeId || "").trim()));

    const validUsers = [];
    const skipped = [];

    // 2. Filter duplicates
    augmentedUsers.forEach(user => {
      const email = (user["Email ID"] || "").toLowerCase().trim();
      const empId = (user["Employee ID"] || "").trim();

      let isDuplicate = false;
      let reason = "";

      if (email && existingEmails.has(email)) {
        isDuplicate = true;
        reason = `${email}: Email already exists`;
      } else if (empId && existingIds.has(empId)) {
        isDuplicate = true;
        reason = `${empId}: Employee ID already exists`;
      }

      if (isDuplicate) {
        skipped.push(reason);
      } else {
        // Add to valid list AND update local sets to prevent duplicates within the upload file itself
        validUsers.push(user);
        if (email) existingEmails.add(email);
        if (empId) existingIds.add(empId);
      }
    });

    // 3. Upload only valid users
    if (validUsers.length > 0) {
      const r = await axios.post(process.env.SHEET_API, {
        action: "bulkUploadUsers",
        users: validUsers
      });

      if (!r.data.success) {
        return res.status(400).json({
          success: false,
          message: "Bulk upload failed (Apps Script error)"
        });
      }
    }

    // 4. Return result with skipped list
    return res.json({
      success: true,
      message: `Checked ${augmentedUsers.length} rows. Uploaded ${validUsers.length} new users.`,
      data: {
        uploaded: validUsers.length,
        skipped: skipped
      }
    });

  } catch (err) {
    console.error("Bulk Upload Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// /* ================= DOWNLOAD CSV TEMPLATE ================= */
// exports.downloadUserTemplate = (req, res) => {
//   const headers = [
//     "Serial Number",
//     "First Name",
//     "Last Name",
//     "Email ID",
//     "Old Password",
//     "New Password",
//     "Updated Date & Time",
//     "Employee ID",
//     "Designation",
//     "Account Number",
//     "PF Number",
//     "LOP Days"
//   ];

//   // Create CSV content
//   const csvContent = headers.join(",") + "\n";

//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=User_Bulk_Template.csv"
//   );
//   res.setHeader(
//     "Content-Type",
//     "text/csv"
//   );

//   res.send(csvContent);
// };

// /* ================= DOWNLOAD CSV TEMPLATE ================= */
// exports.downloadUserTemplate = (req, res) => {
//   const headers = [
//     "serial number",
//     "first name",
//     "last name",
//     "email id",
//     "old password",
//     "new password",
//     "updated date/time",
//     "employeeId",
//     "designation",
//     "accountNo",
//     "pfNo",
//     "lopDays"
//   ];

//   // CSV header row
//   const csvContent = headers.join(",") + "\n";

//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=User_Bulk_Template.csv"
//   );
//   res.setHeader(
//     "Content-Type",
//     "text/csv"
//   );

//   res.send(csvContent);
// };

exports.downloadUserTemplate = (req, res) => {
  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email ID",
    "Old Password",
    "New Password",
    "Updated Date",
    "Employee ID"
  ];

  const csvContent = headers.join(",") + "\n";

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=User_Bulk_Template.csv"
  );
  res.setHeader("Content-Type", "text/csv");

  res.send(csvContent);
};

exports.deleteUser = async (req, res) => {
  const { row } = req.body;

  if (!row) {
    return res.status(400).json({
      success: false,
      message: "Row number required"
    });
  }

  try {
    const r = await axios.post(process.env.SHEET_API, {
      action: "deleteUser",
      row
    });

    return res.json(r.data);

  } catch (err) {
    console.error("Delete User Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/* =====================================================
   BULK UPLOAD USERS (FULLY FIXED + VALIDATED)
===================================================== */
/* =====================================================
   BULK UPLOAD USERS (FULLY FIXED + VALIDATED)
===================================================== */
exports.bulkUploadUsers = async (req, res) => {
  const { users } = req.body;

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Users array required"
    });
  }

  const validUsers = [];
  const rejected = [];

  users.forEach((u, index) => {
    const errors = [];
    const newUser = {};

    // 🔁 Normalize Keys with Aliases
    // First Name
    newUser.firstName = (
      u["First Name"] || u["first name"] || u["Firstname"] || u["Name"] || ""
    ).trim();

    // Last Name
    newUser.lastName = (
      u["Last Name"] || u["last name"] || u["Lastname"] || ""
    ).trim();

    // Email
    newUser.email = (
      u["Email ID"] || u["Email"] || u["email"] || u["Email Address"] || ""
    ).trim();

    // Employee ID
    newUser.employeeId = (
      u["Employee ID"] || u["employee id"] || u["ID"] || u["Emp ID"] || ""
    ).trim();

    // Password
    newUser.password = (
      u["Password"] || u["New Password"] || u["password"] || ""
    ).trim();


    // ✅ Backend Validations (STRICT)
    if (newUser.firstName.length < 2) errors.push("First Name must be at least 2 characters");
    if (newUser.lastName.length < 1) errors.push("Last Name is required");

    // Email Validation
    if (!newUser.email) {
      errors.push("Email is required");
    } else if (!newUser.email.includes("@")) {
      errors.push("Invalid email format (must contain @)");
    }

    // Employee ID Validation
    if (!newUser.employeeId) {
      errors.push("Employee ID is required");
    } else if (!/^VTAB/i.test(newUser.employeeId)) {
      errors.push("Employee ID must start with 'VTAB'");
    }

    // Password Validation
    if (newUser.password.length < 4) {
      errors.push("Password must be at least 4 characters");
    }

    if (errors.length > 0) {
      rejected.push({
        row: index + 1,
        employeeId: newUser.employeeId || "N/A",
        email: newUser.email || "N/A",
        errors
      });
    } else {
      // Add standard "First Name", "Last Name" keys for Google Sheet compatibility if needed
      // (The Sheet API likely expects specific keys based on `createUser` payload)
      // `createUser` sends: firstName, lastName, employeeId, email, password
      // The Sheet API bulk handler might expect the same or "First Name" etc. 
      // Let's assume the Sheet API (Apps Script) expects the keys that were originally being sent or standardizes them.
      // Based on previous code, it was sending `validUsers` which had "First Name" etc. 
      // Let's check `createUser` again. `createUser` sends camelCase variables.
      // But `bulkUploadUsers` in the previous code was sending the raw CSV rows (which had "First Name").
      // The Apps Script likely matches headers. 
      // To be safe, let's send BOTH camelCase and Title Case to cover all bases for the Sheet.

      validUsers.push({
        ...newUser,
        "First Name": newUser.firstName,
        "Last Name": newUser.lastName,
        "Email ID": newUser.email,
        "Employee ID": newUser.employeeId,
        "Password": newUser.password,
        "New Password": newUser.password // Just in case
      });
    }
  });

  // ❌ If no valid rows
  if (validUsers.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid users to upload. Please check errors.",
      rejected
    });
  }

  try {
    // 🔥 Send ONLY clean data to Sheet API
    const r = await axios.post(process.env.SHEET_API, {
      action: "bulkUploadUsers",
      users: validUsers
    });

    if (!r.data.success) {
      return res.status(400).json({
        success: false,
        message: r.data.message || "Bulk upload failed (Google Sheet Error)",
        rejected // Return any additional rejections from Sheet if any
      });
    }

    return res.json({
      success: true,
      message: `Successfully uploaded ${validUsers.length} users.`,
      uploaded: validUsers.length,
      skipped: rejected.length,
      rejected
    });

  } catch (err) {
    console.error("Bulk Upload Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error during bulk upload"
    });
  }
};



// /* ================= DOWNLOAD CSV TEMPLATE ================= */
// exports.downloadUserTemplate = (req, res) => {
//   const headers = [
//     "Serial Number",
//     "First Name",
//     "Last Name",
//     "Email ID",
//     "Old Password",
//     "New Password",
//     "Updated Date & Time",
//     "Employee ID",
//     "Designation",
//     "Account Number",
//     "PF Number",
//     "LOP Days"
//   ];

//   // Create CSV content
//   const csvContent = headers.join(",") + "\n";

//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=User_Bulk_Template.csv"
//   );
//   res.setHeader(
//     "Content-Type",
//     "text/csv"
//   );

//   res.send(csvContent);
// };

// /* ================= DOWNLOAD CSV TEMPLATE ================= */
// exports.downloadUserTemplate = (req, res) => {
//   const headers = [
//     "serial number",
//     "first name",
//     "last name",
//     "email id",
//     "old password",
//     "new password",
//     "updated date/time",
//     "employeeId",
//     "designation",
//     "accountNo",
//     "pfNo",
//     "lopDays"
//   ];

//   // CSV header row
//   const csvContent = headers.join(",") + "\n";

//   res.setHeader(
//     "Content-Disposition",
//     "attachment; filename=User_Bulk_Template.csv"
//   );
//   res.setHeader(
//     "Content-Type",
//     "text/csv"
//   );

//   res.send(csvContent);
// };

exports.downloadUserTemplate = (req, res) => {
  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email ID",
    "Old Password",
    "New Password",
    "Updated Date",
    "Employee ID"
  ];

  const csv = headers.join(",") + "\n";

  res.setHeader(
    "Content-Disposition",
    "attachment; filename=User_Bulk_Template.csv"
  );
  res.setHeader("Content-Type", "text/csv");
  res.status(200).send(csv);
};
