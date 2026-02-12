const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./config/db");
const Employee = require("./models/Employee");
const employees = require("./data/employees");

const seedData = async () => {
  try {
    await connectDB();

    // OPTIONAL: clear old data
    await Employee.deleteMany();

    // Insert new data
    await Employee.insertMany(employees);

    console.log("✅ Employees data inserted successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error inserting data", error);
    process.exit(1);
  }
};

seedData();
