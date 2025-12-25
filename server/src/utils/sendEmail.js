import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Điền email của bạn vào .env
        pass: process.env.EMAIL_PASS, // Điền App Password vào .env
      },
    });

    const mailOptions = {
      from: '"PERN Support Team" <no-reply@pernapp.com>',
      to: email,
      subject: "Mã xác thực đặt lại mật khẩu",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1AC404FFFF;">Yêu cầu đặt lại mật khẩu</h2>
          <p>Bạn vừa yêu cầu đặt lại mật khẩu. Đây là mã OTP của bạn:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${otp}</h1>
          <p>Mã này sẽ hết hạn sau <strong>5 phút</strong>.</p>
          <p style="color: #888; font-size: 12px;">Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    return false;
  }
};

export default sendEmail;
