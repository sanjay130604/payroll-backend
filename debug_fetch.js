const axios = require('axios');
const fs = require('fs');

async function debug() {
  try {
    const res = await axios.get('http://localhost:5000/api/profile/all');
    console.log('Status:', res.status);
    console.log('Data sample:', JSON.stringify(res.data, null, 2));
    fs.writeFileSync('profile_debug.json', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

debug();
