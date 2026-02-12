const payrolls = [
  {
    employeeName: "Sanjay Saravanan",
    month: "March 2025",
    earnings: {
      basic: 42000,
      hra: 15000,
      specialAllowance: 3000,
      dataAllowance: 1000,
      travelAllowance: 2000,
      shiftAllowance: 1500,
      otherAllowance: 500
    },
    deductions: {
      pf: 1800,
      tds: 2500,
      lop: 0,
      insurance: 800,
      others: 200
    }
  },
  {
    employeeName: "Ravi Kumar",
    month: "March 2025",
    earnings: {
      basic: 59500,
      hra: 18000,
      specialAllowance: 5000,
      dataAllowance: 1200,
      travelAllowance: 2500,
      shiftAllowance: 1800,
      otherAllowance: 700
    },
    deductions: {
      pf: 2550,
      tds: 4200,
      lop: 1,
      insurance: 1000,
      others: 300
    }
  }
];

module.exports = payrolls;
