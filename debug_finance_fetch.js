const axios = require('axios');
require('dotenv').config();

const FINANCE_API = process.env.FINANCE_SHEET_API;

async function testFetch() {
    console.log("Testing getMonthlyFinance without params...");
    try {
        const r1 = await axios.post(FINANCE_API, {
            action: "getMonthlyFinance"
        });
        console.log("Response 1 (No params):", r1.data);
    } catch (e) {
        console.log("Error 1:", e.message);
    }

    console.log("\nTesting getFinanceByYear (2026)...");
    try {
        const r3 = await axios.post(FINANCE_API, {
            action: "getFinanceByYear",
            year: "2026"
        });
        console.log("Response 3 (Year 2026):", JSON.stringify(r3.data, null, 2).substring(0, 500)); // Log first 500 chars
    } catch (e) {
        console.log("Error 3:", e.message);
    }
}

testFetch();
