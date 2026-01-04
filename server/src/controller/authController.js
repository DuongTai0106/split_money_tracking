import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import verifyAccountEmail from "../utils/verifyAccountEmail.js"
import { cloudinary } from "../config/cloudinary.js";
import {getPublicIdFromUrl} from "../utils/cloudinaryHelper.js"

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // 1. Kiểm tra user tồn tại
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userCheck.rows.length > 0)
      return res.status(401).json({ message: "Email đã tồn tại!" });

    // 2. Hash mật khẩu (Salt round = 10)
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    // 3. Insert vào DB
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [username, email, bcryptPassword]
    );

    // 4. Tạo token
    const token = jwt.sign(
      { id: newUser.rows[0].user_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({
      token,
      user: newUser.rows[0],
      message: "Register successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// --- API 1: KHỞI TẠO ĐĂNG KÝ (Gửi OTP) ---
export const initRegister = async (req, res) => {
    const { email, username } = req.body;
    console.log(`[initRegister] Request received for email: ${email}`);
    try {
        console.log("[initRegister] Checking if email exists...");
        // 1. Kiểm tra xem Email đã có người dùng chưa (Quan trọng)
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            console.log("[initRegister] Email already exists.");
            return res.status(409).json({ message: "Email này đã được sử dụng!" });
        }

        // 2. Tạo OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

        // 3. Lưu OTP vào bảng tạm (Xóa OTP cũ của email này nếu có)
        console.log("[initRegister] Saving OTP to DB...");
        await pool.query('DELETE FROM registration_otps WHERE email = $1', [email]);
        await pool.query(
            'INSERT INTO registration_otps (email, otp, expires_at) VALUES ($1, $2, $3)',
            [email, otp, expiresAt]
        );
        console.log("[initRegister] OTP saved.");

        // 4. Gửi Email
        console.log("[initRegister] Sending email...");
        const emailSent = await verifyAccountEmail(email, otp);
        if (!emailSent) {
            console.log("[initRegister] Failed to send email.");
            return res.status(500).json({ message: "Không thể gửi email. Vui lòng kiểm tra lại địa chỉ email." });
        }
        console.log("[initRegister] Email sent successfully.");

        res.json({ message: "Mã xác thực đã được gửi tới email của bạn" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// --- API 2: HOÀN TẤT ĐĂNG KÝ (Check OTP -> Tạo User) ---
export const completeRegister = async (req, res) => {
    const { username, email, password, otp } = req.body;
    try {
        // 1. Kiểm tra OTP
        const otpCheck = await pool.query(
            'SELECT * FROM registration_otps WHERE email = $1 AND otp = $2',
            [email, otp]
        );

        if (otpCheck.rows.length === 0) {
            return res.status(400).json({ message: "Mã OTP không chính xác" });
        }

        if (new Date() > new Date(otpCheck.rows[0].expires_at)) {
            return res.status(400).json({ message: "Mã OTP đã hết hạn" });
        }

        // 2. Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Tạo User chính thức
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        // 4. Dọn dẹp OTP
        await pool.query('DELETE FROM registration_otps WHERE email = $1', [email]);

        // 5. Tự động đăng nhập luôn (Tạo Token & Cookie)
        const token = generateToken(newUser.rows[0].user_id);
        res.cookie('token', token, getCookieOptions());

        const { password_hash, ...userInfo } = newUser.rows[0];
        res.json({ message: "Đăng ký thành công", user: userInfo });

    } catch (err) {
        console.error(err);
        // Handle lỗi duplicate nếu lỡ có race condition
        if (err.code === '23505') { 
            return res.status(409).json({ message: "Email đã tồn tại" });
        }
        res.status(500).json({ message: "Server Error" });
    }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res.status(401).json({ message: "Sai email hoặc password" });

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password_hash
    );
    if (!validPassword)
      return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

    const token = jwt.sign(
      { id: user.rows[0].user_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, getCookieOptions());
    const { password_hash, ...userInfo } = user.rows[0];
    res.json({ message: "Đăng nhập thành công", user: userInfo });
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({ message: "Đăng xuất thành công" });
};

export const getProfile = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.user_id || req.user.id;
    const result = await client.query(
      "SELECT user_id, username, email, avatar_url, created_at FROM users WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  } finally {
    client.release();
  }
};

// 2. Cập nhật Profile (Avatar + Username)
export const updateProfile = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.user_id || req.user.id;
    const { username } = req.body;
    let newAvatarUrl = null;

    // Nếu có file ảnh gửi lên
    if (req.file) {
      newAvatarUrl = req.file.path;

      // Tìm ảnh cũ để xóa trên Cloudinary
      const oldUserRes = await client.query(
        "SELECT avatar_url FROM users WHERE user_id = $1",
        [userId]
      );
      const oldUrl = oldUserRes.rows[0]?.avatar_url;

      if (oldUrl) {
        const publicId = getPublicIdFromUrl(oldUrl);
        if (publicId) cloudinary.uploader.destroy(publicId);
      }
    }

    // Tạo câu query động
    let query = "UPDATE users SET username = $1";
    let params = [username];

    if (newAvatarUrl) {
      query += ", avatar_url = $2 WHERE user_id = $3 RETURNING *";
      params.push(newAvatarUrl, userId);
    } else {
      query += " WHERE user_id = $2 RETURNING *";
      params.push(userId);
    }

    const result = await client.query(query, params);

    res.json({
      success: true,
      message: "Cập nhật hồ sơ thành công",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi cập nhật hồ sơ" });
  } finally {
    client.release();
  }
};

// 3. Đổi Mật Khẩu
export const changePassword = async (req, res) => {
  const client = await pool.connect();
  try {
    const userId = req.user.user_id || req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Lấy mật khẩu cũ trong DB
    const userRes = await client.query(
      "SELECT password_hash FROM users WHERE user_id = $1",
      [userId]
    );
    const user = userRes.rows[0];

    // So sánh mật khẩu cũ
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update DB
    await client.query(
      "UPDATE users SET password_hash = $1 WHERE user_id = $2",
      [hashedPassword, userId]
    );

    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  } finally {
    client.release();
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // 1. Kiểm tra email có tồn tại trong hệ thống không
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      // Vì lý do bảo mật, vẫn báo thành công dù email không tồn tại (để tránh hacker dò email)
      // Nhưng ở môi trường dev tôi sẽ báo lỗi để bạn dễ test
      return res
        .status(404)
        .json({ message: "Email không tồn tại trong hệ thống" });
    }

    // 2. Tạo OTP ngẫu nhiên 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Xóa OTP cũ của email này (nếu có) để tránh rác DB
    await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);

    // 4. Lưu OTP mới vào DB (Hết hạn sau 5 phút)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Now + 5 mins
    await pool.query(
      "INSERT INTO password_resets (email, otp, expires_at) VALUES ($1, $2, $3)",
      [email, otp, expiresAt]
    );

    // 5. Gửi Email
    const emailSent = await sendEmail(email, otp);
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Lỗi gửi email. Vui lòng thử lại sau." });
    }

    res.json({ message: "Mã OTP đã được gửi tới email của bạn" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// BƯỚC 2: Kiểm tra OTP (Để chuyển sang màn hình nhập pass)
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM password_resets WHERE email = $1 AND otp = $2",
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Mã OTP không chính xác" });
    }

    const record = result.rows[0];
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn" });
    }

    res.json({ message: "OTP hợp lệ" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// BƯỚC 3: Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    // Check lại OTP lần nữa cho chắc chắn (security)
    const result = await pool.query(
      "SELECT * FROM password_resets WHERE email = $1 AND otp = $2",
      [email, otp]
    );

    if (
      result.rows.length === 0 ||
      new Date() > new Date(result.rows[0].expires_at)
    ) {
      return res
        .status(400)
        .json({ message: "Yêu cầu không hợp lệ hoặc đã hết hạn" });
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update mật khẩu vào bảng users
    await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [
      hashedPassword,
      email,
    ]);

    // Xóa mã OTP đã dùng
    await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
