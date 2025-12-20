const API_URL = "http://localhost:5000";

const groupService = {
  // 1. Lấy danh sách nhóm của tôi
  getMyGroups: async () => {
    try {
      // Giả sử backend có endpoint này (chúng ta sẽ cần viết thêm ở backend nếu chưa có)
      // Hiện tại ta dùng tạm logic lấy list thành viên để filter, hoặc viết endpoint riêng
      const res = await fetch(`${API_URL}/group/my-groups`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      return { ok: false, data: { message: "Lỗi kết nối server" } };
    }
  },

  // 2. Tạo nhóm mới
  createGroup: async (payload) => {
    try {
      const res = await fetch(`${API_URL}/group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      return { ok: false, data: { message: "Lỗi kết nối server" } };
    }
  },

  // 3. Tham gia nhóm bằng code
  joinByCode: async (inviteCode) => {
    try {
      const res = await fetch(`${API_URL}/group/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      return { ok: false, data: { message: "Lỗi kết nối server" } };
    }
  },

  // 4. Lấy chi tiết thành viên
  getMembers: async (groupId) => {
    try {
      const res = await fetch(`${API_URL}/group/${groupId}/members`, {
        credentials: "include",
      });
      return await res.json();
    } catch (e) {
      return [];
    }
  },
};

export default groupService;
