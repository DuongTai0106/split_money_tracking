import pool from "../config/db.js";
import { cloudinary } from "../config/cloudinary.js";
import { formatDateGroup } from "../utils/time.js";

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

// export const getMyGroups = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Query lấy nhóm mà user tham gia + đếm số thành viên
//     const query = `
//       SELECT g.*
//       FROM groups g
//       JOIN group_members gm ON g.id = gm.group_id
//       WHERE gm.user_id = $1
//       ORDER BY g.created_at DESC
//     `;

//     const result = await pool.query(query, [userId]);

//     // Note: Phần tính toán số dư (positive/negative) khá phức tạp,
//     // tạm thời trả về 0 hoặc dummy data. Logic tính tiền sẽ làm ở phần Expenses sau.
//     const formattedGroups = result.rows.map((group) => ({
//       ...group,
//       status: "neutral",
//       amount: "0đ",
//       // member_count đã có sẵn trong row rồi
//       time: new Date(group.created_at).toLocaleDateString("vi-VN"),
//     }));

//     res.status(200).json({ success: true, groups: formattedGroups });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Lỗi Server" });
//   }
// };
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const { search } = req.query; // 1. Lấy từ khóa search từ URL query (?search=...)

    // 2. Xây dựng câu query cơ bản
    let queryText = `
      SELECT g.*
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = $1
    `;

    const queryParams = [userId];

    // 3. Nếu có search, thêm điều kiện vào WHERE
    if (search && search.trim() !== "") {
      queryText += ` AND g.name ILIKE $2`; // ILIKE để tìm không phân biệt hoa thường
      queryParams.push(`%${search.trim()}%`); // Thêm % để tìm kiếm tương đối
    }

    // 4. Thêm sắp xếp
    queryText += ` ORDER BY g.created_at DESC`;

    const result = await pool.query(queryText, queryParams);

    const formattedGroups = result.rows.map((group) => ({
      ...group,
      // Logic status/amount tạm thời mock hoặc tính toán sau
      status: "neutral",
      amount: "0đ",
      time: new Date(group.created_at).toLocaleDateString("vi-VN"),
    }));

    res.status(200).json({ success: true, groups: formattedGroups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

export const getGroupDetails = async (req, res) => {
  const client = await pool.connect();
  try {
    const groupId = req.params.id;
    // const currentUserId = req.user.user_id; // Lưu ý: req.user lấy từ middleware, check xem nó là .id hay .user_id

    // GIẢ SỬ middleware auth của bạn gán req.user = { id: ... } hoặc { user_id: ... }
    // Hãy đảm bảo biến này đúng. Mình tạm dùng user_id cho khớp DB.
    const currentUserId = req.user.user_id || req.user.id;

    // 1. Lấy thông tin nhóm & thành viên
    // SỬA: Thay u.id -> u.user_id, u.full_name -> u.username
    const groupQuery = `
            SELECT 
                g.*, 
                json_agg(json_build_object(
                    'id', u.user_id,      
                    'name', u.username,   
                    'avatar', u.avatar_url        -- Tạm để NULL vì bảng chưa có cột avatar
                )) as members
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            JOIN users u ON gm.user_id = u.user_id  -- JOIN bằng user_id
            WHERE g.id = $1
            GROUP BY g.id
        `;
    const groupRes = await client.query(groupQuery, [groupId]);

    if (groupRes.rows.length === 0)
      return res.status(404).json({ message: "Nhóm không tồn tại" });
    const groupInfo = groupRes.rows[0];

    // 2. Lấy danh sách Bills & Details
    // SỬA: Thay b.payer_id = u.id -> b.payer_id = u.user_id
    const billsQuery = `
            SELECT 
                b.id, b.title, b.amount, b.category, b.created_at, b.payer_id,
                u.username as payer_name, -- Lấy username thay vì full_name
                (
                    SELECT json_agg(json_build_object('user_id', bd.user_id, 'amount', bd.amount))
                    FROM bill_details bd WHERE bd.bill_id = b.id
                ) as splits
            FROM bills b
            JOIN users u ON b.payer_id = u.user_id -- JOIN bằng user_id
            WHERE b.group_id = $1
            ORDER BY b.created_at DESC
        `;
    const billsRes = await client.query(billsQuery, [groupId]);
    const allBills = billsRes.rows;

    // --- XỬ LÝ LOGIC SỐ DƯ (BALANCE) ---
    let myBalance = 0;
    let totalGroupSpend = 0;
    let debtDetails = {};

    groupInfo.members.forEach((m) => {
      if (m.id !== currentUserId) debtDetails[m.id] = 0;
    });

    allBills.forEach((bill) => {
      totalGroupSpend += parseFloat(bill.amount);
      const isPayer = bill.payer_id === currentUserId;

      // Kiểm tra nếu bill có splits (tránh lỗi null)
      if (bill.splits) {
        bill.splits.forEach((split) => {
          const splitAmount = parseFloat(split.amount);

          if (isPayer) {
            if (split.user_id !== currentUserId) {
              myBalance += splitAmount;
              debtDetails[split.user_id] =
                (debtDetails[split.user_id] || 0) + splitAmount;
            }
          } else if (split.user_id === currentUserId) {
            myBalance -= splitAmount;
            debtDetails[bill.payer_id] =
              (debtDetails[bill.payer_id] || 0) - splitAmount;
          }
        });
      }
    });

    const balanceDetailList = Object.keys(debtDetails)
      .map((uid) => {
        const amount = debtDetails[uid];
        // So sánh lỏng (==) vì key object là string, id có thể là int
        if (amount === 0) return null;
        const member = groupInfo.members.find((m) => m.id == uid);
        return {
          id: uid,
          name: member ? member.name : "Unknown",
          avatar: member ? member.avatar : "",
          amount: amount,
        };
      })
      .filter((item) => item !== null);

    // --- XỬ LÝ TRANSACTIONS ---
    const groupedTransactions = {};
    allBills.forEach((bill) => {
      const dateKey = formatDateGroup(bill.created_at);
      if (!groupedTransactions[dateKey]) groupedTransactions[dateKey] = [];

      let shareAmountText = "";
      let isLender = bill.payer_id === currentUserId;

      // Safe check cho splits
      const splits = bill.splits || [];

      if (isLender) {
        const myUsage =
          splits.find((s) => s.user_id === currentUserId)?.amount || 0;
        const lendAmount = parseFloat(bill.amount) - parseFloat(myUsage);
        shareAmountText = `${lendAmount.toLocaleString()}đ`;
      } else {
        const myDebt =
          splits.find((s) => s.user_id === currentUserId)?.amount || 0;
        shareAmountText = `${parseFloat(myDebt).toLocaleString()}đ`;
      }

      groupedTransactions[dateKey].push({
        id: bill.id,
        title: bill.title,
        payer: bill.payer_name,
        amount: `${parseFloat(bill.amount).toLocaleString()}đ`,
        shareAmount: shareAmountText,
        category: bill.category,
        isLender: isLender,
        timestamp: bill.created_at,
      });
    });

    const transactionList = Object.keys(groupedTransactions).map((date) => ({
      date,
      items: groupedTransactions[date],
    }));

    res.status(200).json({
      success: true,
      group: {
        id: groupInfo.id,
        name: groupInfo.name,
        image: groupInfo.image_url,
        memberCount: groupInfo.members.length,
        members: groupInfo.members,
        dateRange: `Tạo ngày ${new Date(
          groupInfo.created_at
        ).toLocaleDateString("vi-VN")}`,
      },
      balance: {
        amount: myBalance,
        totalGroupSpend: `${totalGroupSpend.toLocaleString()}đ`,
        details: balanceDetailList,
      },
      transactions: transactionList,
    });
  } catch (error) {
    console.error("GET DETAILS ERROR:", error); // Log lỗi chi tiết ra console server
    res.status(500).json({ message: "Lỗi server", error: error.message });
  } finally {
    client.release();
  }
};

// export const createBill = async (req, res) => {
//   const client = await pool.connect();

//   try {
//     const { groupId, title, amount, category, splitDetails } = req.body;
//     // splitDetails là mảng: [{ user_id: 1, amount: 50000 }, { user_id: 2, amount: 50000 }]
//     const payerId = req.user.user_id || req.user.id; // Người tạo bill là người trả tiền (mặc định)

//     // Validate cơ bản
//     if (!groupId || !amount || !title) {
//       return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
//     }

//     await client.query("BEGIN"); // Bắt đầu transaction

//     // 1. Tạo Bill
//     const billQuery = `
//       INSERT INTO bills (group_id, payer_id, title, amount, category, created_at)
//       VALUES ($1, $2, $3, $4, $5, NOW())
//       RETURNING id
//     `;
//     const billRes = await client.query(billQuery, [
//       groupId,
//       payerId,
//       title,
//       amount,
//       category,
//     ]);
//     const billId = billRes.rows[0].id;

//     // 2. Tạo Bill Details (Vòng lặp insert từng người)
//     // Lưu ý: splitDetails phải được tính toán chuẩn từ Frontend gửi lên
//     for (const detail of splitDetails) {
//       const detailQuery = `
//         INSERT INTO bill_details (bill_id, user_id, amount)
//         VALUES ($1, $2, $3)
//       `;
//       await client.query(detailQuery, [billId, detail.user_id, detail.amount]);
//     }

//     await client.query("COMMIT"); // Lưu tất cả nếu không có lỗi

//     res.status(201).json({
//       success: true,
//       message: "Tạo hóa đơn thành công",
//       billId: billId,
//     });
//   } catch (error) {
//     await client.query("ROLLBACK"); // Hủy hết nếu có lỗi
//     console.error("Create Bill Error:", error);
//     res
//       .status(500)
//       .json({ message: "Lỗi server khi tạo hóa đơn", error: error.message });
//   } finally {
//     client.release();
//   }
// };

// export const createBill = async (req, res) => {
//   const client = await pool.connect();

//   try {
//     // 1. Lấy thêm payer_id từ frontend gửi lên
//     const { groupId, title, amount, category, splitDetails, payer_id } =
//       req.body;

//     // Logic xác định người trả tiền:
//     // - Nếu frontend gửi payer_id thì dùng nó.
//     // - Nếu không (hoặc null), fallback về người đang login (req.user.id).
//     const creatorId = req.user.user_id || req.user.id;
//     const finalPayerId = payer_id || creatorId;

//     // Validate cơ bản
//     if (!groupId || !amount || !title) {
//       return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
//     }

//     if (!splitDetails || splitDetails.length === 0) {
//       return res.status(400).json({ message: "Danh sách chia tiền trống" });
//     }

//     await client.query("BEGIN"); // Bắt đầu transaction

//     // ---------------------------------------------------------
//     // BƯỚC 1: Tạo Bill (Hóa đơn tổng)
//     // Lưu ý: payer_id ở đây là người thực sự bỏ tiền ra
//     // ---------------------------------------------------------
//     const billQuery = `
//       INSERT INTO bills (group_id, payer_id, title, amount, category, created_by, created_at)
//       VALUES ($1, $2, $3, $4, $5, $6, NOW())
//       RETURNING id
//     `;
//     const billRes = await client.query(billQuery, [
//       groupId,
//       finalPayerId, // Người trả tiền (được chọn từ dropdown)
//       title,
//       amount,
//       category,
//       creatorId, // Người tạo đơn (để log lịch sử ai là người nhập liệu)
//     ]);
//     const billId = billRes.rows[0].id;

//     // ---------------------------------------------------------
//     // BƯỚC 2: Xử lý chi tiết & Tạo Nợ (Core Logic)
//     // ---------------------------------------------------------
//     for (const detail of splitDetails) {
//       // 2.1. Lưu vào bill_details (Để biết ai tham gia vào bill này)
//       const detailQuery = `
//         INSERT INTO bill_details (bill_id, user_id, amount)
//         VALUES ($1, $2, $3)
//       `;
//       await client.query(detailQuery, [billId, detail.user_id, detail.amount]);

//       // 2.2. TẠO GHI CHÚ NỢ (QUAN TRỌNG)
//       // Logic: Nếu người tham gia (detail.user_id) KHÁC người trả tiền (finalPayerId)
//       // => Người tham gia đang NỢ người trả tiền.
//       if (String(detail.user_id) !== String(finalPayerId)) {
//         const debtQuery = `
//           INSERT INTO debts (group_id, creditor_id, debtor_id, amount, bill_id, status)
//           VALUES ($1, $2, $3, $4, $5, 'unpaid')
//         `;
//         // creditor_id: Chủ nợ (Người trả tiền)
//         // debtor_id: Con nợ (Người hưởng thụ)
//         await client.query(debtQuery, [
//           groupId,
//           finalPayerId,
//           detail.user_id,
//           detail.amount,
//           billId,
//         ]);
//       }
//     }

//     await client.query("COMMIT"); // Lưu tất cả

//     res.status(201).json({
//       success: true,
//       message: "Tạo hóa đơn thành công",
//       billId: billId,
//     });
//   } catch (error) {
//     await client.query("ROLLBACK"); // Hủy hết nếu có lỗi
//     console.error("Create Bill Error:", error);
//     res.status(500).json({
//       message: "Lỗi server khi tạo hóa đơn",
//       error: error.message,
//     });
//   } finally {
//     client.release();
//   }
// };

export const createBill = async (req, res) => {
  const client = await pool.connect();

  try {
    // Lấy dữ liệu từ Frontend
    const { groupId, title, amount, category, splitDetails, payer_id } =
      req.body;

    // 1. Xác định người trả tiền (Payer)
    // Nếu frontend không gửi payer_id, mặc định lấy người đang login (req.user.user_id)
    const currentUserId = req.user.user_id || req.user.id;
    const finalPayerId = payer_id || currentUserId;

    // Validate
    if (!groupId || !amount || !title) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    if (!splitDetails || splitDetails.length === 0) {
      return res.status(400).json({ message: "Danh sách chia tiền trống" });
    }

    // Validate Total Split matches Bill Amount (allow small drift < 100vnd)
    const totalSplit = splitDetails.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0
    );
    if (Math.abs(totalSplit - amount) > 100) {
      return res.status(400).json({
        message: `Tổng tiền chia (${totalSplit}) không khớp hóa đơn (${amount})`,
      });
    }

    await client.query("BEGIN"); // --- BẮT ĐẦU TRANSACTION ---

    // ---------------------------------------------------------
    // BƯỚC 1: Insert vào bảng 'bills'
    // ---------------------------------------------------------
    const billQuery = `
      INSERT INTO bills (group_id, payer_id, title, amount, category)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const billRes = await client.query(billQuery, [
      groupId,
      finalPayerId, // Người trả tiền thực tế
      title,
      amount,
      category || "general",
    ]);
    const billId = billRes.rows[0].id;

    // ---------------------------------------------------------
    // BƯỚC 2: Insert chi tiết & Tạo nợ
    // ---------------------------------------------------------
    for (const detail of splitDetails) {
      // 2.1. Insert vào 'bill_details' (Lưu lịch sử chia tiền)
      const detailQuery = `
        INSERT INTO bill_details (bill_id, user_id, amount)
        VALUES ($1, $2, $3)
      `;
      await client.query(detailQuery, [billId, detail.user_id, detail.amount]);

      // 2.2. Insert vào 'debts' (Quan trọng: Tạo sổ nợ)
      // Logic: Chỉ tạo nợ nếu "Người hưởng thụ" KHÁC "Người trả tiền"
      if (String(detail.user_id) !== String(finalPayerId)) {
        const debtQuery = `
          INSERT INTO debts (group_id, creditor_id, debtor_id, amount, bill_id, status)
          VALUES ($1, $2, $3, $4, $5, 'unpaid')
        `;

        // creditor_id = finalPayerId (Chủ nợ)
        // debtor_id   = detail.user_id (Con nợ)
        await client.query(debtQuery, [
          groupId,
          finalPayerId,
          detail.user_id,
          detail.amount,
          billId,
        ]);
      }
    }

    await client.query("COMMIT"); // --- LƯU THÀNH CÔNG ---

    // Socket.IO: Emit event to all users in the group
    const io = req.app.get("io");
    if (io) {
      io.to(`group_${groupId}`).emit("group-updated", {
        type: "NEW_EXPENSE",
        billId: billId,
        payerId: finalPayerId,
        amount: amount,
      });
      console.log(`Emitted group-updated for group_${groupId}`);
    }

    res.status(201).json({
      success: true,
      message: "Tạo hóa đơn thành công",
      billId: billId,
    });
  } catch (error) {
    await client.query("ROLLBACK"); // --- CÓ LỖI, HỦY HẾT ---
    console.error("Create Bill Error:", error);
    res.status(500).json({
      message: "Lỗi server khi tạo hóa đơn",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// export const settleDebt = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { groupId, receiverId, amount } = req.body;
//     const payerId = req.user.user_id || req.user.id; // Người bấm nút thanh toán là người trả

//     if (!groupId || !receiverId || !amount) {
//       return res.status(400).json({ message: "Thiếu thông tin thanh toán" });
//     }

//     await client.query("BEGIN");

//     // 1. Tạo Bill loại 'settlement'
//     // Title sẽ là: "Thanh toán nợ"
//     const billQuery = `
//       INSERT INTO bills (group_id, payer_id, title, amount, category, created_at)
//       VALUES ($1, $2, $3, $4, 'settlement', NOW())
//       RETURNING id
//     `;
//     // Lưu ý: amount phải là số dương
//     const absAmount = Math.abs(amount);

//     // Tên hiển thị ví dụ: "Thanh toán tiền"
//     const billRes = await client.query(billQuery, [
//       groupId,
//       payerId,
//       "Thanh toán nợ",
//       absAmount,
//     ]);
//     const newBillId = billRes.rows[0].id;

//     // 2. Tạo Bill Detail
//     // Người nhận tiền (receiverId) sẽ được ghi vào bill_details
//     const detailQuery = `
//       INSERT INTO bill_details (bill_id, user_id, amount)
//       VALUES ($1, $2, $3)
//     `;
//     await client.query(detailQuery, [newBillId, receiverId, absAmount]);

//     await client.query("COMMIT");

//     res.status(200).json({
//       success: true,
//       message: "Đã thanh toán thành công!",
//     });
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error("Settle Debt Error:", error);
//     res.status(500).json({ message: "Lỗi server khi thanh toán" });
//   } finally {
//     client.release();
//   }
// };
export const settleDebt = async (req, res) => {
  const client = await pool.connect();
  try {
    const { groupId, receiverId, amount } = req.body;
    const payerId = req.user.user_id || req.user.id; // Người trả tiền

    if (!groupId || !receiverId || !amount) {
      return res.status(400).json({ message: "Thiếu thông tin thanh toán" });
    }

    const payAmount = parseFloat(amount); // Số tiền thực trả

    await client.query("BEGIN");

    // 1. Tạo Bill lịch sử (giữ nguyên logic cũ để lưu vết giao dịch)
    const billQuery = `
      INSERT INTO bills (group_id, payer_id, title, amount, category, created_at)
      VALUES ($1, $2, $3, $4, 'settlement', NOW())
      RETURNING id
    `;
    const billRes = await client.query(billQuery, [
      groupId,
      payerId,
      "Thanh toán nợ",
      payAmount,
    ]);
    const newBillId = billRes.rows[0].id;

    // Tạo Bill Detail
    const detailQuery = `
      INSERT INTO bill_details (bill_id, user_id, amount)
      VALUES ($1, $2, $3)
    `;
    await client.query(detailQuery, [newBillId, receiverId, payAmount]);

    // ------------------------------------------------------------------
    // 2. XỬ LÝ GẠCH NỢ TRONG BẢNG DEBTS (PHẦN QUAN TRỌNG MỚI THÊM)
    // ------------------------------------------------------------------

    // Tìm tất cả khoản nợ mà Payer đang nợ Receiver trong nhóm này (status = unpaid)
    // Sắp xếp theo cũ nhất trước để trả nợ cũ trước
    const debtsQuery = `
      SELECT id, amount 
      FROM debts 
      WHERE group_id = $1 
        AND debtor_id = $2 
        AND creditor_id = $3 
        AND status = 'unpaid'
      ORDER BY created_at ASC
    `;
    const debtsRes = await client.query(debtsQuery, [
      groupId,
      payerId,
      receiverId,
    ]);
    const debts = debtsRes.rows;

    let remainingMoney = payAmount;

    for (const debt of debts) {
      if (remainingMoney <= 0) break;

      const debtAmount = parseFloat(debt.amount);

      if (remainingMoney >= debtAmount) {
        // Trường hợp 1: Tiền trả >= Tiền nợ này -> Xóa sổ khoản nợ này (status = paid)
        await client.query(
          `UPDATE debts SET status = 'paid', amount = 0 WHERE id = $1`,
          [debt.id]
        );
        remainingMoney -= debtAmount;
      } else {
        // Trường hợp 2: Tiền trả < Tiền nợ -> Trừ bớt số tiền nợ, status vẫn là unpaid
        const newDebtAmount = debtAmount - remainingMoney;
        await client.query(`UPDATE debts SET amount = $1 WHERE id = $2`, [
          newDebtAmount,
          debt.id,
        ]);
        remainingMoney = 0;
      }
    }

    // Lưu ý: Nếu remainingMoney vẫn còn dương (trả dư),
    // bạn có thể chọn tạo một record debt ngược lại (Receiver nợ lại Payer),
    // nhưng để đơn giản ta coi như đã gạch hết nợ cũ.

    await client.query("COMMIT");

    // Socket.IO: Emit event to update balances
    const io = req.app.get("io");
    if (io) {
      io.to(`group_${groupId}`).emit("group-updated", {
        type: "DEBT_SETTLED",
        payerId,
        receiverId,
        amount: payAmount,
      });
    }

    res.status(200).json({
      success: true,
      message: "Đã thanh toán và cập nhật dư nợ thành công!",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Settle Debt Error:", error);
    res.status(500).json({ message: "Lỗi server khi thanh toán" });
  } finally {
    client.release();
  }
};

export const getGroupSettings = async (req, res) => {
  const client = await pool.connect();
  try {
    const groupId = req.params.id;
    const currentUserId = req.user.user_id || req.user.id;

    // Lấy thông tin Group
    const groupQuery = `SELECT * FROM groups WHERE id = $1`;
    const groupRes = await client.query(groupQuery, [groupId]);
    if (groupRes.rows.length === 0)
      return res.status(404).json({ message: "Nhóm không tồn tại" });

    let group = groupRes.rows[0];

    // Nếu chưa có invite_code, tự động tạo và lưu luôn
    if (!group.invite_code) {
      const newCode = generateInviteCode();
      await client.query("UPDATE groups SET invite_code = $1 WHERE id = $2", [
        newCode,
        groupId,
      ]);
      group.invite_code = newCode;
    }

    // Lấy danh sách Members kèm Role
    const membersQuery = `
            SELECT 
                u.user_id as id, 
                u.username, 
                u.email, 
                u.avatar_url as avatar, 
                gm.role 
            FROM group_members gm
            JOIN users u ON gm.user_id = u.user_id
            WHERE gm.group_id = $1
            ORDER BY gm.role DESC, u.username ASC
        `;
    const membersRes = await client.query(membersQuery, [groupId]);

    // Map data để khớp với UI (thêm cờ isMe)
    const members = membersRes.rows.map((m) => ({
      ...m,
      name: m.username, // UI dùng 'name', DB dùng 'username'
      isMe: m.id === currentUserId,
    }));

    res.json({
      success: true,
      data: {
        ...group,
        image: group.image_url, // UI dùng 'image', DB dùng 'image_url'
        members,
      },
      currentUserId: currentUserId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  } finally {
    client.release();
  }
};

// 2. Cập nhật Group (Có upload ảnh)
export const updateGroup = async (req, res) => {
  const client = await pool.connect();
  try {
    const groupId = req.params.id;
    const { name, currency, start_date, end_date } = req.body;

    // Check quyền (chỉ Owner/Admin mới được sửa - Tuỳ logic của bạn)
    // ... (bỏ qua check quyền để code gọn, bạn nên thêm vào)

    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path;
    }

    // Tạo câu query động (chỉ update trường nào có gửi lên)
    // Cách đơn giản: Update hết (giữ nguyên ảnh cũ nếu không up ảnh mới)

    let query = `
            UPDATE groups 
            SET name = $1, currency = $2, start_date = $3, end_date = $4
        `;
    const params = [name, currency, start_date || null, end_date || null];

    if (imageUrl) {
      query += `, image_url = $5 WHERE id = $6`;
      params.push(imageUrl, groupId);
    } else {
      query += ` WHERE id = $5`;
      params.push(groupId);
    }

    await client.query(query, params);

    res.json({
      success: true,
      message: "Cập nhật thành công",
      image: imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi cập nhật nhóm" });
  } finally {
    client.release();
  }
};

export const joinGroupByCode = async (req, res) => {
  const client = await pool.connect();
  try {
    const { inviteCode } = req.body;
    const userId = req.user.user_id || req.user.id;

    if (!inviteCode) {
      return res.status(400).json({ message: "Vui lòng nhập mã nhóm" });
    }

    // 1. Tìm nhóm dựa trên mã mời
    // Lưu ý: So sánh invite_code (có thể cần UPPERCASE để không phân biệt hoa thường)
    const findGroupQuery = `SELECT id, name FROM groups WHERE UPPER(invite_code) = UPPER($1)`;
    const groupRes = await client.query(findGroupQuery, [inviteCode]);

    if (groupRes.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Mã nhóm không hợp lệ hoặc không tồn tại" });
    }

    const group = groupRes.rows[0];

    // 2. Kiểm tra xem user đã là thành viên chưa
    const checkMemberQuery = `SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2`;
    const memberRes = await client.query(checkMemberQuery, [group.id, userId]);

    if (memberRes.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "Bạn đã là thành viên của nhóm này rồi" });
    }

    // 3. Thêm user vào nhóm
    const joinQuery = `
      INSERT INTO group_members (group_id, user_id, role, joined_at)
      VALUES ($1, $2, 'member', NOW())
    `;
    await client.query(joinQuery, [group.id, userId]);

    res.status(200).json({
      success: true,
      message: `Đã tham gia nhóm "${group.name}" thành công!`,
      groupId: group.id,
    });
  } catch (error) {
    console.error("Join Group Error:", error);
    res.status(500).json({ message: "Lỗi server" });
  } finally {
    client.release();
  }
};

export const getGroupByInviteCode = async (req, res) => {
  const client = await pool.connect();
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ message: "Mã mời không hợp lệ" });
    }

    const query = `
      SELECT id, name, image_url, member_count 
      FROM groups 
      WHERE UPPER(invite_code) = UPPER($1)
    `;
    const result = await client.query(query, [code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy nhóm" });
    }

    res.json({
      success: true,
      group: result.rows[0],
    });
  } catch (error) {
    console.error("Get Group By Code Error:", error);
    res.status(500).json({ message: "Lỗi server" });
  } finally {
    client.release();
  }
};

// controllers/groupController.js

export const deleteGroup = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params; // groupId
    const currentUserId = req.user.user_id || req.user.id; // Lấy ID người đang request

    // 1. Kiểm tra nhóm tồn tại và quyền sở hữu
    const checkQuery = `SELECT id, created_by FROM groups WHERE id = $1`;
    const checkRes = await client.query(checkQuery, [id]);

    if (checkRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Nhóm không tồn tại",
      });
    }

    const group = checkRes.rows[0];

    // So sánh ID (ép về String để tránh lỗi khác kiểu dữ liệu int/string)
    if (String(group.created_by) !== String(currentUserId)) {
      return res.status(403).json({
        success: false,
        message:
          "Bạn không có quyền giải tán nhóm này (Chỉ chủ nhóm mới được xóa)",
      });
    }

    // 2. Thực hiện xóa nhóm
    // Nhờ cấu hình ON DELETE CASCADE ở Bước 1, lệnh này sẽ tự động:
    // Xóa group -> Xóa group_members -> Xóa bills -> Xóa bill_details -> Xóa debts
    const deleteQuery = `DELETE FROM groups WHERE id = $1`;
    await client.query(deleteQuery, [id]);

    return res.status(200).json({
      success: true,
      message: "Giải tán nhóm thành công",
      data: group,
      currentUserId: currentUserId,
    });
  } catch (error) {
    console.error("Delete Group Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa nhóm",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

export const getDashboardStats = async (req, res) => {
  const client = await pool.connect();
  try {
    const currentUserId = req.user.user_id || req.user.id;

    // 1. Lấy danh sách chi tiết nợ (Ai nợ mình & Mình nợ ai)
    // Chỉ lấy status = 'unpaid'
    const query = `
      SELECT 
        d.id,
        d.amount,
        d.created_at,
        g.name as group_name,
        g.id as group_id,
        -- Thông tin người liên quan (Partner)
        CASE 
          WHEN d.debtor_id = $1 THEN c.username -- Mình là con nợ -> Lấy tên chủ nợ
          ELSE db.username                      -- Mình là chủ nợ -> Lấy tên con nợ
        END as partner_name,
        CASE 
            WHEN d.debtor_id = $1 THEN c.avatar_url
            ELSE db.avatar_url
        END as partner_avatar,
        -- Xác định loại nợ (owe: mình nợ, lend: người khác nợ mình)
        CASE 
          WHEN d.debtor_id = $1 THEN 'owe'
          ELSE 'lend'
        END as type
      FROM debts d
      JOIN groups g ON d.group_id = g.id
      JOIN users c ON d.creditor_id = c.user_id -- Join để lấy thông tin chủ nợ
      JOIN users db ON d.debtor_id = db.user_id -- Join để lấy thông tin con nợ
      WHERE (d.debtor_id = $1 OR d.creditor_id = $1) 
      AND d.status = 'unpaid'
      ORDER BY d.created_at DESC
    `;

    const result = await client.query(query, [currentUserId]);
    const details = result.rows;

    // 2. Tính tổng số dư
    let totalBalance = 0;
    details.forEach((item) => {
      const amount = parseFloat(item.amount);
      if (item.type === "lend") {
        totalBalance += amount; // Người ta nợ mình -> Dương
      } else {
        totalBalance -= amount; // Mình nợ người ta -> Âm
      }
    });

    res.json({
      success: true,
      data: {
        totalBalance, // Tổng tiền (Ví dụ: -50000 hoặc 200000)
        details, // Danh sách chi tiết
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ message: "Lỗi server" });
  } finally {
    client.release();
  }
};
