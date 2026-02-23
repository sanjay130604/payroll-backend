const axios = require("axios");

/**
 * Utility to make reliable requests to Google Sheets API
 * with retry logic and consistent timeout handling.
 */
const sheetRequest = async (url, data, retries = 3, timeout = 10000) => {
    let lastError;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.post(url, data, {
                timeout,
                headers: {
                    "Content-Type": "application/json"
                }
            });

            // Check if response has success field
            if (response.data && response.data.success !== false) {
                return response.data;
            } else {
                throw new Error(response.data?.message || "Operation failed in Google Sheets");
            }
        } catch (err) {
            lastError = err;
            console.error(`Attempt ${i + 1} failed for ${data.action}:`, err.message);

            // If it's a 4xx error (except 429), don't retry
            if (err.response && err.response.status >= 400 && err.response.status < 500 && err.response.status !== 429) {
                break;
            }

            // Wait before retry (exponential backoff)
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    throw lastError;
};

module.exports = { sheetRequest };
