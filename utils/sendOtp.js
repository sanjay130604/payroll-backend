const axios = require("axios");

const sendOtp = async (email, otp) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Payroll Admin",
          email: process.env.EMAIL, // verified sender in Brevo
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Admin OTP Verification",
        htmlContent: `
          <h2>Admin Password Reset</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          accept: "application/json",
        },
        timeout: 15000, // important
      }
    );

    console.log("✅ OTP Email sent via Brevo API:", response.data);
  } catch (err) {
    console.error("❌ Brevo API email failed:", err.response?.data || err.message);
    throw err;
  }
};

module.exports = sendOtp;


// const nodemailer = require("nodemailer");

// const sendOtp = async (email, otp) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,              // smtp-relay.brevo.com
//       port: Number(process.env.SMTP_PORT),      // 587
//       secure: false,
//       requireTLS: true,
//       auth: {
//         user: process.env.SMTP_USER,            // Brevo SMTP user
//         pass: process.env.SMTP_PASS,            // Brevo SMTP key
//       },
//     });

//     await transporter.verify();
//     console.log("✅ SMTP connection verified");

//     await transporter.sendMail({
//       from: `"Payroll Admin" <${process.env.EMAIL}>`,
//       to: email,
//       subject: "Admin OTP Verification",
//       html: `
//         <h2>Admin Password Reset</h2>
//         <p>Your OTP is:</p>
//         <h1>${otp}</h1>
//         <p>This OTP is valid for 5 minutes.</p>
//       `,
//     });

//     console.log("✅ OTP Email sent successfully via Brevo SMTP");
//   } catch (err) {
//     console.error("❌ Email send failed:", err.message);
//     throw err;
//   }
// };

// module.exports = sendOtp;

// // const nodemailer = require("nodemailer");

// // const sendOtp = async (email, otp) => {
// //   try {
// //     const transporter = nodemailer.createTransport({
// //       host: process.env.SMTP_HOST,       // smtp-relay.brevo.com
// //       port: process.env.SMTP_PORT,       // 587
// //       secure: false,                     // TLS
// //       auth: {
// //         user: process.env.SMTP_USER,     // Brevo SMTP user
// //         pass: process.env.SMTP_PASS,     // Brevo SMTP key
// //       },
// //     });

// //     await transporter.sendMail({
// //       from: `"Payroll Admin" <${process.env.EMAIL}>`,
// //       to: email,
// //       subject: "Admin OTP Verification",
// //       html: `
// //         <h2>Admin Password Reset</h2>
// //         <p>Your OTP is:</p>
// //         <h1>${otp}</h1>
// //         <p>This OTP is valid for 5 minutes.</p>
// //       `,
// //     });

// //     console.log("✅ OTP Email sent successfully via Brevo SMTP");
// //   } catch (err) {
// //     console.error("❌ Email send failed:", err.message);
// //     throw err;
// //   }
// // };

// // module.exports = sendOtp;



// // // const nodemailer = require("nodemailer");

// // // const sendOtp = async (email, otp) => {
// // //   try {
// // //     const transporter = nodemailer.createTransport({
// // //       service: "gmail",
// // //       auth: {
// // //         user: process.env.EMAIL,
// // //         pass: process.env.EMAIL_PASS, // Gmail App Password
// // //       },
// // //     });

// // //     await transporter.sendMail({
// // //       from: `"Payroll Admin" <${process.env.EMAIL}>`,
// // //       to: email,
// // //       subject: "Admin OTP Verification",
// // //       html: `
// // //         <h2>Admin Password Reset</h2>
// // //         <p>Your OTP is:</p>
// // //         <h1>${otp}</h1>
// // //         <p>This OTP is valid for 5 minutes.</p>
// // //       `,
// // //     });

// // //     console.log("✅ OTP Email sent successfully");
// // //   } catch (err) {
// // //     console.error("❌ Email send failed:", err.message);
// // //     throw err;
// // //   }
// // // };

// // // module.exports = sendOtp;


// // // const axios = require("axios");

// // // module.exports = async (email, otp) => {
// // //   try {
// // //     console.log("BREVO_API_KEY exists:", !!process.env.BREVO_API_KEY);

// // //     const response = await axios.post(
// // //       "https://api.brevo.com/v3/smtp/email",
// // //       {
// // //         sender: {
// // //           name: "Payroll Admin",
// // //           email: process.env.EMAIL,
// // //         },
// // //         to: [{ email }],
// // //         subject: "Admin OTP Verification",
// // //         htmlContent: `
// // //           <h2>Admin Password Reset</h2>
// // //           <p>Your OTP is:</p>
// // //           <h1>${otp}</h1>
// // //           <p>This OTP is valid for 5 minutes.</p>
// // //         `,
// // //       },
// // //       {
// // //         headers: {
// // //           "api-key": process.env.BREVO_API_KEY,
// // //           "accept": "application/json",
// // //           "content-type": "application/json",
// // //         },
// // //       }
// // //     );

// // //     console.log("✅ Brevo Response:", response.data);
// // //   } catch (error) {
// // //     console.error("🔥 BREVO API ERROR FULL:");
// // //     console.error(error.response?.data || error.message || error);
// // //     throw error;
// // //   }
// // // };
