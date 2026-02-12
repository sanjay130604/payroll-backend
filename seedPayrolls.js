require("dotenv").config(); 

const connectDB = require("./config/db");
const Employee = require("./models/Employee");
const Payroll = require("./models/Payroll");
const payrolls = require("./data/payrolls");


const seed = async () => {
  await connectDB();

  const employees = await Employee.find();
  await Payroll.deleteMany();

  const payrollDocs = payrolls.map(p => ({
    employeeId: employees[p.employeeIndex]._id,
    month: p.month,
    earnings: p.earnings,
    deductions: p.deductions
  }));

  await Payroll.insertMany(payrollDocs);

  console.log("✅ Payrolls seeded successfully");
  process.exit();
};

seed();
