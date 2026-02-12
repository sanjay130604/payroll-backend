const axios = require("axios");
require("dotenv").config();

async function debug() {
    try {
        const api = process.env.SHEET_API; // Reads from .env
        console.log("Using API:", api);
        const res = await axios.post(api, { action: "getAllUsers" });
        if (res.data.success) {
            console.log("USERS FETCHED:", res.data.users.length);
            // Check first user
            console.log(JSON.stringify(res.data.users[0], null, 2));
        } else {
            console.log("FAILED:", res.data);
        }
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

debug();
