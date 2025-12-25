import pool from "../config/db.js";
import { cloudinary } from "../config/cloudinary.js";

export const createGroup = async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, currency } = req.body;
    const userId = req.user.id; // Lấy từ middleware xác thực (JWT)

    if (!name) {
      if (req.file) await cloudinary.uploader.destroy(req.file.filename);
      return res.status(400).json({ message: "Tên nhóm là bắt buộc" });
    }
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path;
    } else {
      imageUrl =
        "https://res.cloudinary.com/dbio5e2s1/image/upload/v1/default-group.png";
    }

    console.log("User creates group: ", userId);

    await client.query("BEGIN"); // Bắt đầu transaction

    // 1. Insert vào bảng groups
    const groupResult = await client.query(
      `INSERT INTO groups (name, currency, image_url, created_by) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, currency, imageUrl, userId]
    );
    const newGroup = groupResult.rows[0];

    // 2. Insert người tạo vào bảng group_members (role: owner)
    await client.query(
      `INSERT INTO group_members (group_id, user_id, role) 
       VALUES ($1, $2, 'owner')`,
      [newGroup.id, userId]
    );

    await client.query("COMMIT"); // Lưu thay đổi

    newGroup.member_count = 1;

    res.status(201).json({ success: true, group: newGroup });
  } catch (error) {
    await client.query("ROLLBACK"); // Hoàn tác nếu lỗi
    if (req.file) {
      console.log("Xảy ra lỗi, đang xóa ảnh trên cloudinary");
      await cloudinary.uploader.destroy(req.file.filename);
    }
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server", error: error.message });
  } finally {
    client.release();
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    // Query lấy nhóm mà user tham gia + đếm số thành viên
    const query = `
      SELECT g.*
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = $1
      ORDER BY g.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    // Note: Phần tính toán số dư (positive/negative) khá phức tạp,
    // tạm thời trả về 0 hoặc dummy data. Logic tính tiền sẽ làm ở phần Expenses sau.
    const formattedGroups = result.rows.map((group) => ({
      ...group,
      status: "neutral",
      amount: "0đ",
      // member_count đã có sẵn trong row rồi
      time: new Date(group.created_at).toLocaleDateString("vi-VN"),
    }));

    res.status(200).json({ success: true, groups: formattedGroups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};
