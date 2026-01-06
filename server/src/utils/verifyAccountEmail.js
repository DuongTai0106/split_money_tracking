import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Resend } from 'resend';
dotenv.config();

const sendEmail = async (email, otp) => {
  console.log(`[sendEmail] Preparing to send email to ${email}`);

  // OPTION 1: RESEND API (Prioritized for Deployed Env)
  if (process.env.RESEND_API_KEY) {
    console.log("[sendEmail] Using Resend API...");
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: "duongthanhtai@resend.dev", // Default testing domain
        to: email,
        subject: "Mã xác thực đăng kí tài khoản",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1AC404FFFF;">Mã xác thực tài khoản</h2>
          <p>Bạn vừa đăng kí tài khoản mới. Đây là mã OTP của bạn:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${otp}</h1>
          <p>Mã này sẽ hết hạn sau <strong>5 phút</strong>.</p>
          <p style="color: #888; font-size: 12px;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
        </div>
      `,
      });

      if (error) {
        console.error("Resend Error:", error);
        return { success: false, error: error.message };
      }

      console.log("[sendEmail] Email sent via Resend:", data);
      return { success: true };
    } catch (err) {
      console.error("Resend Exception:", err);
      return { success: false, error: err.message };
    }
  }

  // OPTION 2: Nodemailer (Fallback or Local)
  // 0. Validate Env Vars for Nodemailer
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("[sendEmail] MISSING ENV VARIABLES: EMAIL_USER or EMAIL_PASS is not set!");
      return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // Try 465 (SSL) which is less likely to be blocked than 587
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Timeout settings (increased slightly)
      connectionTimeout: 20000, 
      greetingTimeout: 10000,
      socketTimeout: 20000,
      // Debug config for production
      logger: true,
      debug: true, 
    });

    const mailOptions = {
      from: '"PERN Support Team" <no-reply@pernapp.com>',
      to: email,
      subject: "Mã xác thực đăng kí tài khoản",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1AC404FFFF;">Mã xác thực tài khoản</h2>
          <p>Bạn vừa đăng kí tài khoản mới. Đây là mã OTP của bạn:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${otp}</h1>
          <p>Mã này sẽ hết hạn sau <strong>5 phút</strong>.</p>
          <p style="color: #888; font-size: 12px;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
        </div>
      `,
    };

    console.log("[sendEmail] Sending mail now...");
    await transporter.sendMail(mailOptions);
    console.log("[sendEmail] Mail sent successfully via transporter.");
    return { success: true };
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    return { success: false, error: error.message };
  }
};

export default sendEmail;
