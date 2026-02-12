const axios = require("axios");

const SHEET_API = "https://script.google.com/macros/s/AKfycbya05VsvZa_6x-BJDRPGCUsRzsQUniHfGcacdR2XkZHAy0vFzwCP8w96wB3ThfMb7CJ2A/exec";
const EMAIL = "innocentsanjay2004@gmail.com";

async function checkHistory() {
    try {
        console.log("Fetching history for:", EMAIL);
        const response = await axios.post(SHEET_API, {
            action: "getSalaryHistory",
            email: EMAIL
        });

        if (response.data.success) {
            console.log("History received:");
            const history = response.data.history;

            let janCount = 0;
            history.forEach((h, i) => {
                if (h.month === "January") {
                    janCount++;
                    console.log(`\nEntry ${i}: ${h.month} (${h.salaryMonth})`);
                    console.log(`  Basic: ${h.salary}`);
                    console.log(`  HRA: ${h.hra}`);
                    console.log(`  Other Allow: ${h.otherAllowance}`);
                    console.log(`  Special Pay: ${h.specialPay}`);
                    console.log(`  Date: ${h.date}`);
                    console.log(`  Full Data: ${JSON.stringify(h)}`);
                }
            });

            console.log(`\nTotal January Entries: ${janCount}`);
        } else {
            console.log("Failed:", response.data.message);
        }
    } catch (err) {
        console.error("Error:", err.message);
    }
}

checkHistory();
