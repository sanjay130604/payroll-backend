const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: String,
  designation: String,
  accountNo: String,

  basicSalary: Number,
  hra: Number,
  specialAllowance: Number,
  dataAllowance: Number,
  travelAllowance: Number,
  shiftAllowance: Number,
  otherAllowance: Number,  

  pf: Number,
  tds: Number,
  lop: Number,
  insurance: Number,
  others: Number
});

module.exports = mongoose.model("Employee", EmployeeSchema);
