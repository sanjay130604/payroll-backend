const axios = require("axios");
require("dotenv").config();

async function debug() {
    try {
        const api = process.env.FINANCE_SHEET_API;
        console.log("Using Finance API:", api);

        const payload = {
            action: "createFinanceEntry",
            salaryMonth: "2026-01",
            email: "innocentsanjay2004@gmail.com",
            employeeId: "EMP001",
            firstName: "sanjayvijay",
            lastName: "s",
            workingDays: "27",
            leavesAvailed: "1",
            leavesUsed: "1",
            totalLeaves: "1",
            paidDays: "1",
            remainingPaidLeaves: "1",
            basic: "20000",
            hra: "15000",
            otherAllowance: "2000",
            specialPay: "1000",
            incentive: "1000",
            tds: "1000",
            panCard: "23456789",
            otherDeductions: "0",
            dateOfJoining: "2026-02-03", // YYYY-MM-DD
            lopDays: "0"
        };

        const res = await axios.post(api, payload);
        console.log("Response Status:", res.status);
        console.log("Response Data:", JSON.stringify(res.data, null, 2));

    } catch (err) {
        if (err.response) {
            console.log("Error Response Data:", JSON.stringify(err.response.data));
        } else {
            console.error("Error:", err.message);
        }
    }
}

debug();
