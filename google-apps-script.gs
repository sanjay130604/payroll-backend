const FINANCE_SHEET_ID = "1l_mnbXPOMEXnrShAu5M2H8Ggxkd-1jbfR9hHzYWhOEc";
const ADMIN_SHEET_ID = "1nkkSGdZYBtesxsSwzHGBntBnaIUod6qfrR9zECxsRb4";
const TAB = "Tab1";
const FIXATION_TAB = "Pay Fixation";
const USER_TAB = "user details";
const ALLOWANCE_TAB = "ExternalAllowances";
const PAYROLL_TEMPLATE_TAB = "PayrollTemplate"; // NEW: PayrollTemplate sheet

function doGet(e) {
    return ContentService.createTextOutput("Service is running").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
    try {
        const data = JSON.parse(e.postData.contents);
        const ss = SpreadsheetApp.openById(FINANCE_SHEET_ID);
        const sheet = ss.getSheetByName(TAB);
        const fixationSheet = ss.getSheetByName(FIXATION_TAB);
        const rows = sheet.getDataRange().getValues();
        const fixationRows = fixationSheet ? fixationSheet.getDataRange().getValues() : [];
        const ssTz = ss.getSpreadsheetTimeZone();

        /* =====================================================
           GET PAYROLL TEMPLATE DATA
        ===================================================== */
        if (data.action === "getPayrollTemplate") {
            const templateSheet = ss.getSheetByName(PAYROLL_TEMPLATE_TAB);
            if (!templateSheet) {
                return json({ success: false, message: "PayrollTemplate tab not found" });
            }

            const templateRows = templateSheet.getDataRange().getValues();
            const list = [];

            // Expected columns: Employee Mail id, Employee ID, first name, last name, 
            // Other Allowance, Special Pay, paid days, No of Working Days
            for (let i = 1; i < templateRows.length; i++) {
                if (!templateRows[i][0] && !templateRows[i][1]) continue; // Skip empty rows

                list.push({
                    email: String(templateRows[i][0] || "").toLowerCase().trim(),
                    employeeId: String(templateRows[i][1] || "").trim().toUpperCase(),
                    firstName: String(templateRows[i][2] || ""),
                    lastName: String(templateRows[i][3] || ""),
                    otherAllowance: Number(templateRows[i][4] || 0),
                    specialPay: Number(templateRows[i][5] || 0),
                    paidDays: Number(templateRows[i][6] || 0),
                    workingDays: Number(templateRows[i][8] || 0), // Column I (index 8)
                    lopDays: 0 // Can be calculated or added as a column if needed
                });
            }

            return json({ success: true, list });
        }

        /* =====================================================
           VALIDATE PAY FIXATION UPLOAD
        ===================================================== */
        if (data.action === "validatePayFixationUpload") {
            const list = data.rows;
            if (!list || !Array.isArray(list)) return json({ success: false, message: "No data provided" });

            const adminSs = SpreadsheetApp.openById(ADMIN_SHEET_ID);
            const userSheet = adminSs.getSheetByName(USER_TAB);
            const userRows = userSheet ? userSheet.getDataRange().getValues() : [];

            const adminMap = {};
            for (let i = 1; i < userRows.length; i++) {
                const uId = String(userRows[i][8]).trim().toUpperCase();
                const uEmail = String(userRows[i][3]).toLowerCase().trim();
                if (uId) {
                    adminMap[uId] = { email: uEmail, name: userRows[i][1] + " " + userRows[i][2] };
                }
            }

            const fixationMap = {};
            for (let i = 1; i < fixationRows.length; i++) {
                const fId = String(fixationRows[i][0]).trim().toUpperCase();
                if (fId) {
                    fixationMap[fId] = {
                        basic: Number(fixationRows[i][4] || 0),
                        variable: Number(fixationRows[i][5] || 0)
                    };
                }
            }

            const validatedList = list.map((item, idx) => {
                const empId = String(item.employeeId).trim().toUpperCase();
                const newBasic = Number(item.basic || 0);
                const newVariable = Number(item.variablePay || 0);

                const errors = [];
                let status = "VALID";
                let message = "Ready to Update";

                if (!adminMap[empId]) {
                    errors.push("User not found in Admin Details");
                    status = "INVALID";
                }

                if (status === "VALID") {
                    const current = fixationMap[empId];
                    if (current) {
                        const isSame = current.basic === newBasic && current.variable === newVariable;
                        if (isSame) {
                            errors.push("Duplicate data (No changes detected)");
                            status = "INVALID";
                            message = "Duplicate";
                        } else {
                            message = "Update Existing";
                        }
                    } else {
                        message = "New Entry";
                    }
                }

                return {
                    ...item,
                    status,
                    message: status === "INVALID" ? errors.join(", ") : message,
                    errors
                };
            });

            return json({ success: true, validatedRows: validatedList });
        }

        /* =====================================================
           GET ALL PAY FIXATION
        ===================================================== */
        if (data.action === "getPayFixation") {
            if (!fixationSheet) return json({ success: false, message: "Fixation tab not found" });
            const list = [];
            for (let i = 1; i < fixationRows.length; i++) {
                if (!fixationRows[i][0]) continue;
                list.push({
                    employeeId: fixationRows[i][0],
                    firstName: fixationRows[i][1],
                    lastName: fixationRows[i][2],
                    email: fixationRows[i][3],
                    basic: fixationRows[i][4] || 0,
                    variablePay: fixationRows[i][5] || 0
                });
            }
            return json({ success: true, list });
        }

        /* =====================================================
           UPDATE PAY FIXATION (with Variable Pay & Sync to Tab1)
        ===================================================== */
        if (data.action === "updatePayFixation") {
            const empId = String(data.employeeId).trim();
            const basic = Number(data.basic || 0);
            const variable = Number(data.variablePay || 0);
            let fixationUpdated = false;

            for (let i = 1; i < fixationRows.length; i++) {
                if (String(fixationRows[i][0]).trim() === empId) {
                    // Col 5: Basic, Col 6: Variable Pay
                    fixationSheet.getRange(i + 1, 5).setValue(basic);
                    fixationSheet.getRange(i + 1, 6).setValue(variable);
                    // Zero out HRA(7), Other(8), Special(9), TDS(10)
                    fixationSheet.getRange(i + 1, 7, 1, 4).setValues([[0, 0, 0, 0]]);
                    fixationUpdated = true;
                    break;
                }
            }

            if (!fixationUpdated) {
                return json({ success: false, message: "Employee not found in Fixation" });
            }

            // Sync to Financial Management (Tab1) with new calculation
            for (let i = 1; i < rows.length; i++) {
                if (String(rows[i][2]).trim() === empId) {
                    const workingDays = Number(rows[i][5] || 30);
                    const paidDays = Number(rows[i][9] || workingDays);
                    const ratio = workingDays > 0 ? (paidDays / workingDays) : 1;

                    const totalBasic = basic > 0 ? Math.round(basic * ratio) : 0;
                    const totalVariable = variable; // No proration — direct value

                    // Update Finance Sheet Basic with PRORATED Basic
                    sheet.getRange(i + 1, 12).setValue(totalBasic);

                    // Sync Variable Pay to Incentive (Col 16 / Col P)
                    sheet.getRange(i + 1, 16).setValue(totalVariable);

                    const hra = totalBasic > 0 ? Math.round(totalBasic * 0.3) : 0;
                    const tds = totalBasic > 0 ? Math.round(totalBasic * 0.1) : 0;

                    sheet.getRange(i + 1, 13).setValue(hra);
                    sheet.getRange(i + 1, 17).setValue(tds);

                    const other = Number(rows[i][13] || 0);
                    const special = Number(rows[i][14] || 0);
                    const incentive = totalVariable; // Variable Pay mapped to Incentive

                    // CORRECT CALCULATION: Earnings = Basic  + Other + Special + Incentive
                    const earnings = totalBasic + other + special + incentive;
                    // Take Home = Earnings - TDS
                    const takeHome = earnings - tds;

                    // Col X (24) is Earnings
                    sheet.getRange(i + 1, 24).setValue(earnings);
                    // Col Y (25) is Take Home
                    if (sheet.getLastColumn() >= 25) {
                        sheet.getRange(i + 1, 25).setValue(takeHome);
                    }
                }
            }

            return json({ success: true, message: "Updated Fixation and Synced to Finance" });
        }

        /* =====================================================
           DELETE PAY FIXATION DATA
        ===================================================== */
        if (data.action === "deletePayFixation") {
            const empId = String(data.employeeId).trim();
            for (let i = 1; i < fixationRows.length; i++) {
                if (String(fixationRows[i][0]).trim() === empId) {
                    fixationSheet.getRange(i + 1, 5, 1, 7).setValues([[0, 0, 0, 0, 0, 0, 0]]);
                    return json({ success: true });
                }
            }
            return json({ success: false });
        }

        /* =====================================================
           BULK UPLOAD PAY FIXATION
        ===================================================== */
        if (data.action === "bulkUploadPayFixation") {
            if (!fixationSheet) return json({ success: false, message: "Fixation tab not found" });
            const list = data.rows;
            let updated = 0; let inserted = 0;

            list.forEach(item => {
                const empId = String(item.employeeId || "").trim();
                const basic = Number(item.basic || 0);
                const variable = Number(item.variablePay || 0);

                let merged = false;
                for (let i = 1; i < fixationRows.length; i++) {
                    if (String(fixationRows[i][0]).trim() === empId) {
                        // Update Basic (Col 5) and Variable (Col 6)
                        fixationSheet.getRange(i + 1, 5).setValue(basic);
                        fixationSheet.getRange(i + 1, 6).setValue(variable);
                        // Zero out others (HRA, Other, Special, TDS, Deductions)
                        fixationSheet.getRange(i + 1, 7, 1, 5).setValues([[0, 0, 0, 0, 0]]);
                        merged = true;
                        updated++;
                        break;
                    }
                }

                if (!merged && empId) {
                    fixationSheet.appendRow([
                        empId,
                        item.firstName || "",
                        item.lastName || "",
                        item.email || "",
                        basic,
                        variable,
                        0, 0, 0, 0, 0
                    ]);
                    inserted++;
                }

                if (empId) {
                    for (let i = 1; i < rows.length; i++) {
                        if (String(rows[i][2]).trim() === empId) {
                            const workingDays = Number(rows[i][5] || 30);
                            const paidDays = Number(rows[i][9] || workingDays);
                            const ratio = workingDays > 0 ? (paidDays / workingDays) : 1;

                            const totalBasic = basic > 0 ? Math.round(basic * ratio) : 0;
                            const totalVariable = variable; // No proration — direct value

                            // Update Finance Sheet Basic with PRORATED Basic
                            sheet.getRange(i + 1, 12).setValue(totalBasic);

                            // Sync Variable Pay to Incentive (Col 16 / Col P)
                            sheet.getRange(i + 1, 16).setValue(totalVariable);

                            const hra = totalBasic > 0 ? Math.round(totalBasic * 0.30) : 0;
                            const tds = totalBasic > 0 ? Math.round(totalBasic * 0.10) : 0;

                            sheet.getRange(i + 1, 13).setValue(hra);
                            sheet.getRange(i + 1, 17).setValue(tds);

                            const other = Number(rows[i][13] || 0);
                            const special = Number(rows[i][14] || 0);
                            const incentive = totalVariable; // Variable Pay mapped to Incentive

                            // CORRECT CALCULATION
                            const earnings = totalBasic + other + special + incentive;
                            const takeHome = earnings - tds;

                            sheet.getRange(i + 1, 24).setValue(earnings);
                            if (sheet.getLastColumn() >= 25) {
                                sheet.getRange(i + 1, 25).setValue(takeHome);
                            }
                        }
                    }
                }
            });
            return json({ success: true, message: `Updated ${updated}, Added ${inserted} records. Synced to Finance.` });
        }

        /* =====================================================
           FETCH EXTERNAL ALLOWANCES
        ===================================================== */
        if (data.action === "getExternalAllowances") {
            const allowanceSheet = ss.getSheetByName(ALLOWANCE_TAB);
            if (!allowanceSheet) return json({ success: true, otherAllowance: 0, specialPay: 0 });

            const values = allowanceSheet.getDataRange().getValues();
            const fullName = (String(data.firstName || "") + " " + String(data.lastName || "")).toLowerCase().trim();

            for (let i = 1; i < values.length; i++) {
                if (String(values[i][0]).toLowerCase().trim() === fullName) {
                    return json({
                        success: true,
                        otherAllowance: Number(values[i][1] || 0),
                        specialPay: Number(values[i][2] || 0)
                    });
                }
            }
            return json({ success: true, otherAllowance: 0, specialPay: 0 });
        }

        /* =====================================================
           CREATE PAYROLL (Dynamic Calculations)
        ===================================================== */
        if (data.action === "createMonthlyFinance") {
            const email = String(data.email).toLowerCase().trim();
            const empId = String(data.employeeId || "").trim();
            const month = String(data.salaryMonth).trim();

            for (let i = 1; i < rows.length; i++) {
                if (isMatch(rows[i], month, email, empId, ssTz)) {
                    return json({ success: false, message: "Payroll already exists" });
                }
            }

            const basic = Number(data.basic || 0);
            const workingDays = Number(data.workingDays || 30);
            const paidDays = Number(data.paidDays || workingDays);

            // Basic from Frontend is already PRORATED (Total Basic)
            const totalBasic = basic;
            const hra = totalBasic > 0 ? Math.round(totalBasic * 0.30) : 0;
            const tds = totalBasic > 0 ? Math.round(totalBasic * 0.10) : 0;
            const other = Number(data.otherAllowance || 0);
            const special = Number(data.specialPay || 0);
            const incentive = Number(data.incentive || 0);

            // CORRECT CALCULATION: Earnings = Basic + Other + Special + Incentive (HRA excluded per user request)
            const earnings = totalBasic + other + special + incentive;
            const takeHome = earnings - tds;

            const r = sheet.getLastRow() + 1;
            sheet.getRange(r, 1).setNumberFormat("@");
            sheet.getRange(r, 1, 1, 25).setValues([[
                String(data.salaryMonth), data.email, data.employeeId, data.firstName, data.lastName,
                workingDays, Number(data.leavesAvailed || 0), Number(data.leavesUsed || 0),
                Number(data.totalLeaves || 0), paidDays, Number(data.remainingPaidLeaves || 0),
                basic, hra, other, special, incentive, tds,
                data.panCard || "", 0,
                new Date(),
                data.dateOfJoining || "", data.payDate ? new Date(data.payDate) : "", Number(data.lopDays || 0),
                earnings, takeHome
            ]]);
            return json({ success: true });
        }

        /* =====================================================
           UPDATE PAYROLL
        ===================================================== */
        if (data.action === "updateMonthlyFinance") {
            const row = data.row;
            const basic = Number(data.basic || 0);
            const workingDays = Number(data.workingDays || 30);
            const paidDays = Number(data.paidDays || workingDays);

            // Basic from Frontend is already PRORATED (Total Basic)
            const totalBasic = basic;
            const hra = totalBasic > 0 ? Math.round(totalBasic * 0.30) : 0;
            const tds = totalBasic > 0 ? Math.round(totalBasic * 0.10) : 0;
            const other = Number(data.otherAllowance || 0);
            const special = Number(data.specialPay || 0);
            const incentive = Number(data.incentive || 0);

            // CORRECT CALCULATION: Earnings = Basic + Other + Special + Incentive (HRA excluded per user request)
            const earnings = totalBasic + other + special + incentive;
            const takeHome = earnings - tds;

            sheet.getRange(row, 1, 1, 25).setValues([[
                data.salaryMonth, data.email, data.employeeId, data.firstName, data.lastName,
                workingDays, data.leavesAvailed, data.leavesUsed, data.totalLeaves,
                paidDays, data.remainingPaidLeaves, basic, hra,
                other, special, incentive, tds,
                data.panCard, 0, new Date(), data.dateOfJoining,
                data.payDate ? new Date(data.payDate) : "", Number(data.lopDays || 0),
                earnings, takeHome
            ]]);
            return json({ success: true });
        }

        /* =====================================================
           GET MONTH PAYROLL
        ===================================================== */
        if (data.action === "getMonthlyFinance") {
            const m = String(data.salaryMonth).trim();
            const e = String(data.email).toLowerCase().trim();
            for (let i = 1; i < rows.length; i++) {
                if (normalizeValueToMonth(rows[i][0], ssTz) === m &&
                    String(rows[i][1]).toLowerCase().trim() === e) {
                    return json({ success: true, row: i + 1, finance: mapRow(rows[i], ssTz) });
                }
            }
            return json({ success: false });
        }

        /* =====================================================
           SALARY HISTORY
        ===================================================== */
        if (data.action === "getSalaryHistory") {
            const email = String(data.email).toLowerCase().trim();
            const searchYear = data.year;
            const searchMonth = data.month;
            const history = [];
            for (let i = 1; i < rows.length; i++) {
                if (String(rows[i][1]).toLowerCase().trim() !== email) continue;
                const salaryMonth = normalizeValueToMonth(rows[i][0], ssTz);
                if (!salaryMonth) continue;
                if (searchYear && !salaryMonth.startsWith(searchYear)) continue;
                if (searchMonth && salaryMonth.split("-")[1] !== String(searchMonth).padStart(2, "0")) continue;

                // netPay maps to Earnings (Col 23/24), grossPay maps to TakeHome (Col 24/25)
                history.push({
                    month: Utilities.formatDate(new Date(salaryMonth + "-01"), ssTz, "MMMM"),
                    salaryMonth, salary: num(rows[i][11]),
                    date: rows[i][21] ? Utilities.formatDate(new Date(rows[i][21]), ssTz, "dd-MM-yyyy") : "-",
                    employeeId: rows[i][2], firstName: rows[i][3], lastName: rows[i][4],
                    hra: num(rows[i][12]), otherAllowance: num(rows[i][13]),
                    specialPay: num(rows[i][14]), incentive: num(rows[i][15]),
                    tds: num(rows[i][16]), lopDays: num(rows[i][22]),
                    workingDays: num(rows[i][5]), totalLeaves: num(rows[i][8]),
                    netPay: num(rows[i][23]), grossPay: num(rows[i][24])
                });
            }
            return json({ success: true, history });
        }

        /* =====================================================
           BULK UPLOAD FINANCE - SOURCED FROM PAY FIXATION
        ===================================================== */
        if (data.action === "bulkUploadFinance") {
            const list = data.rows;
            if (!list || !Array.isArray(list)) return json({ success: false, message: "No data provided" });

            // 1. Prepare Pay Fixation Map
            const fixationMap = {};
            if (fixationSheet) {
                const fRows = fixationSheet.getDataRange().getValues();
                for (let i = 1; i < fRows.length; i++) {
                    const fId = String(fRows[i][0]).trim().toUpperCase(); // Col A: Emp ID
                    if (fId) {
                        fixationMap[fId] = {
                            basic: Number(fRows[i][4] || 0),       // Col E: Base Salary
                            variable: Number(fRows[i][5] || 0)     // Col F: Variable Pay
                        };
                    }
                }
            }

            const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn() + 1).getValues()[0];
            const normalizeName = h => String(h).toLowerCase().replace(/[^a-z]/g, "");
            const headerMap = {};
            headers.forEach((h, i) => {
                let nh = normalizeName(h);
                if (nh === "fristname") nh = "firstname";
                if (nh === "noofworkingday" || nh === "noofworkingdays") nh = "noofworkingday";
                if (nh === "payday" || nh === "paydays") nh = "paydays";
                if (nh === "remainingpaidleaves" || nh === "remainingpaidleave") nh = "remainingpaidleave";
                if (nh === "netpay") nh = "netpay";
                if (nh === "grosspay") nh = "grosspay";
                headerMap[nh] = i;
            });

            if (headerMap["netpay"] === undefined) headerMap["netpay"] = 23;
            if (headerMap["grosspay"] === undefined) headerMap["grosspay"] = 24;

            const processedKeysSet = new Set();
            let updated = 0; let inserted = 0;

            list.forEach(p => {
                let month = ""; let email = ""; let empId = "";
                Object.keys(p).forEach(k => {
                    let nk = normalizeName(k);
                    if (nk === "salarymonth" || nk === "month") month = String(p[k]).trim();
                    if (nk === "employeemailid" || nk === "email") email = String(p[k]).toLowerCase().trim();
                    if (nk === "employeeid" || nk === "id") empId = String(p[k]).trim();
                });

                if (!month || !email || !empId) return;
                // Normalize EmpId for map lookup
                const mapId = empId.toUpperCase();
                const key = `${month}|${email}|${empId}`;
                if (processedKeysSet.has(key)) return;

                let rowIdx = -1;
                for (let i = 1; i < rows.length; i++) {
                    if (isMatch(rows[i], month, email, empId, ssTz)) {
                        rowIdx = i;
                        break;
                    }
                }

                const rowContent = rowIdx > -1 ? [...rows[rowIdx]] : new Array(25).fill("");

                Object.keys(p).forEach(k => {
                    let nk = normalizeName(k);
                    if (nk === "fristname") nk = "firstname";
                    if (nk === "noofworkingday" || nk === "noofworkingdays") nk = "noofworkingday";
                    if (nk === "payday" || nk === "paydays") nk = "paydays";
                    if (nk === "remainingpaidleaves" || nk === "remainingpaidleave") nh = "remainingpaidleave";
                    if (nk === "netpay") nk = "netpay";
                    if (nk === "grosspay") nk = "grosspay";
                    const targetIdx = headerMap[nk];
                    if (targetIdx !== undefined) rowContent[targetIdx] = p[k];
                });

                // --- CALCULATION LOGIC ---
                // Source: Pay Fixation
                const fixData = fixationMap[mapId] || { basic: 0, variable: 0 };

                // Days (Source: Upload/Defaults)
                // Col F (index 5) = Working Days, Col J (index 9) = Paid Days
                const workingDays = num(rowContent[5]) || 30;
                const effectivePaidDays = (rowContent[9] !== "" && rowContent[9] !== undefined) ? num(rowContent[9]) : workingDays;

                // Proration Ratio
                const ratio = workingDays > 0 ? (effectivePaidDays / workingDays) : 0;

                // Calculated Components
                // 1. Basic = Fixation Basic * Ratio
                const calcBasic = Math.round(fixData.basic * ratio);

                // 2. HRA = Calculated Basic * 30%
                const calcHRA = Math.round(calcBasic * 0.30);

                // 3. Incentive = Fixation Variable (No proration — direct value)
                const calcIncentive = fixData.variable;

                // 4. Other Allowance = 0 (Fixed)
                const calcOther = 0;

                // 5. Special Pay = 0 (or from external source)
                const calcSpecial = 0;

                // 6. TDS = Calculated Basic * 10% (keeping existing logic)
                const calcTDS = Math.round(calcBasic * 0.10);

                // Update Row Content with Calculated Values
                rowContent[11] = calcBasic;      // Basic
                rowContent[12] = calcHRA;        // HRA
                rowContent[13] = calcOther;      // Other Allowance
                rowContent[14] = calcSpecial;    // Special Pay
                rowContent[15] = calcIncentive;  // Incentive (from Variable Pay)
                rowContent[16] = calcTDS;        // TDS
                rowContent[18] = 0;              // Other Deductions

                // Earnings & Net Pay
                // Earnings = Basic  + Other + Special + Incentive
                const earnings = calcBasic  + calcOther + calcSpecial + calcIncentive;
                // Take Home = Earnings - TDS - OtherDeductions(0)
                const takeHome = earnings - calcTDS;

                rowContent[23] = earnings; // Col X (Net Pay in UI terms, Earnings)
                rowContent[24] = takeHome; // Col Y (Gross Pay in UI terms, Take Home)

                if (rowIdx > -1) {
                    sheet.getRange(rowIdx + 1, 1, 1, rowContent.length).setValues([rowContent]);
                    updated++;
                } else {
                    if (!rowContent[19]) rowContent[19] = new Date(); // Entry Date
                    sheet.appendRow(rowContent);
                    inserted++;
                }
                processedKeysSet.add(key);
            });

            return json({ success: true, message: `Processed ${inserted + updated} rows. used Pay Fixation source.`, data: { inserted, updated } });
        }

        /* =====================================================
           DROPDOWNS
        ===================================================== */
        if (data.action === "getFinanceDropdowns") {
            const firstNames = new Set(), lastNames = new Set(), emails = new Set();
            for (let i = 1; i < rows.length; i++) {
                if (rows[i][3]) firstNames.add(rows[i][3]);
                if (rows[i][4]) lastNames.add(rows[i][4]);
                if (rows[i][1]) emails.add(rows[i][1]);
            }
            return json({ success: true, firstNames: [...firstNames], lastNames: [...lastNames], emails: [...emails] });
        }

        /* =====================================================
           SEARCH
        ===================================================== */
        if (data.action === "searchFinance") {
            const targetMonth = `${data.year}-${String(data.month).padStart(2, "0")}`;
            const list = [];
            for (let i = 1; i < rows.length; i++) {
                if (normalizeValueToMonth(rows[i][0], ssTz) !== targetMonth) continue;
                if (data.firstName && String(rows[i][3]).toLowerCase().trim() !== String(data.firstName).toLowerCase().trim()) continue;
                if (data.lastName && String(rows[i][4]).toLowerCase().trim() !== String(data.lastName).toLowerCase().trim()) continue;
                if (data.email && String(rows[i][1]).toLowerCase().trim() !== String(data.email).toLowerCase().trim()) continue;
                list.push(mapRow(rows[i], ssTz));
            }
            return json({ success: true, list });
        }

        return json({ success: false, message: "Invalid action" });

    } catch (err) {
        return json({ success: false, error: err.message });
    }
}

/*************************************************
 * HELPERS
 *************************************************/
function isMatch(row, month, email, empId, tz) {
    const rowMonth = normalizeValueToMonth(row[0], tz);
    return (rowMonth === month && String(row[1]).toLowerCase().trim() === email && String(row[2]).trim() === empId);
}

function normalizeValueToMonth(val, tz) {
    if (val instanceof Date) return Utilities.formatDate(val, tz || "GMT", "yyyy-MM");
    let s = String(val).trim();
    if (s.length > 7 && s.includes("-")) return s.substring(0, 7);
    return s;
}

function mapRow(r, tz) {
    return {
        salaryMonth: normalizeValueToMonth(r[0], tz), email: r[1],
        employeeId: r[2], firstName: r[3], lastName: r[4], fullName: r[3] + " " + r[4],
        workingDays: r[5], leavesAvailed: r[6], leavesUsed: r[7], totalLeaves: r[8],
        paidDays: r[9], remainingPaidLeaves: r[10],
        basic: num(r[11]), hra: num(r[12]), otherAllowance: num(r[13]),
        specialPay: num(r[14]), incentive: num(r[15]), tds: num(r[16]),
        panCard: r[17], otherDeductions: num(r[18]),
        entryDate: r[19], dateOfJoining: r[20], payDate: r[21], lopDays: r[22],
        netPay: num(r[23]), grossPay: num(r[24])
    };
}

function num(v) {
    if (v === "" || v === null || v === undefined) return 0;
    if (v instanceof Date) return 0;
    const n = Number(v);
    return isNaN(n) ? 0 : n;
}

function json(o) {
    return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
