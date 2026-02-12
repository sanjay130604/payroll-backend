const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },
    month: {
      type: String,
      required: true
    },
    earnings: {
      basic: { type: Number, default: 1000 },
      hra: { type: Number, default: 0 },
      specialAllowance: { type: Number, default: 0 },
      dataAllowance: { type: Number, default: 0 },
      travelAllowance: { type: Number, default: 0 },
      shiftAllowance: { type: Number, default: 0 },
      otherAllowance: { type: Number, default: 0 }
    },
    deductions: {
      pf: { type: Number, default: 0 },
      tds: { type: Number, default: 0 },
      lop: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      others: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payroll", payrollSchema);
