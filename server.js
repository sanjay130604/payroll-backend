const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const userRoutes = require("./routes/userRoutes");
const financeRoutes = require("./routes/finance.routes");
const profileRoutes = require("./routes/profile.routes");

const app = express();

connectDB();

/* ================= FIXED CORS ================= */
app.use(
  cors({
    origin: ["https://payroll-frontend-glhn.onrender.com", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/users", userRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminAuthRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("✅ Server running");
});


// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const connectDB = require("./config/db");

// const authRoutes = require("./routes/authRoutes");
// const employeeRoutes = require("./routes/employeeRoutes");
// const payrollRoutes = require("./routes/payrollRoutes");
// const adminAuthRoutes = require("./routes/adminAuthRoutes");
// const userRoutes = require("./routes/userRoutes");
// const financeRoutes = require("./routes/finance.routes");
// const profileRoutes = require("./routes/profile.routes");
// const app = express();

// connectDB();

// app.use(cors());
// app.use(express.json());

// // USER ROUTES
// app.use("/api/auth", authRoutes);
// app.use("/api/employees", employeeRoutes);
// app.use("/api/payroll", payrollRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/finance", financeRoutes);
// app.use("/api/profile", profileRoutes);


// // ✅ ADMIN ROUTES (FIXED)
// app.use("/api/admin", adminAuthRoutes);

// app.get("/", (req, res) => {
//   res.send("API Running");
// });

// app.listen(5000, () => {
//   console.log("✅ Server running on http://localhost:5000");
// });
