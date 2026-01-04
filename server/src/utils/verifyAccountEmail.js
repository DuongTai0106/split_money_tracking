import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (email, otp) => {
  console.log(`[sendEmail] Preparing to send email to ${email}`);
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Điền email của bạn vào .env
        pass: process.env.EMAIL_PASS, // Điền App Password vào .env
      },
      // Add timeouts to prevent hanging indefinitely
      connectionTimeout: 10000, 
      greetingTimeout: 5000,
      socketTimeout: 10000,
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
    return true;
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    return false;
  }
};

export default sendEmail;
