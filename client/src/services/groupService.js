const API_URL = import.meta.env.VITE_API_URL;
const groupService = {
  // 1. Lấy danh sách nhóm của tôi
  getMyGroups: async () => {
    try {
      // Giả sử backend có endpoint này (chúng ta sẽ cần viết thêm ở backend nếu chưa có)
      // Hiện tại ta dùng tạm logic lấy list thành viên để filter, hoặc viết endpoint riêng
      const res = await fetch(`${API_URL}/groups/my-groups`, {
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
      // Kiểm tra xem payload có phải là FormData không
      const isFormData = payload instanceof FormData;

      // Cấu hình headers
      const headers = {};

      // QUAN TRỌNG:
      // Nếu là FormData, TA KHÔNG ĐƯỢC set Content-Type thủ công.
      // Browser sẽ tự động set là "multipart/form-data; boundary=..." để backend hiểu.
      // Chỉ khi là JSON thường thì mới set header application/json.
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }

      const res = await fetch(`${API_URL}/groups/create-group`, {
        // Đảm bảo đúng endpoint backend
        method: "POST",
        headers: headers,
        credentials: "include",
        // Nếu là FormData thì để nguyên, nếu là object thường thì stringify
        body: isFormData ? payload : JSON.stringify(payload),
      });

      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      console.error("Service Error:", error);
      return { ok: false, data: { message: "Lỗi kết nối server" } };
    }
  },

  getGroupDetails: async (groupId) => {
    try {
      const res = await fetch(`${API_URL}/groups/${groupId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      return { ok: false, data: { message: "Lỗi kết nối" } };
    }
  },

  createBill: async (payload) => {
    try {
      const res = await fetch(`${API_URL}/groups/bills/create`, {
        // Đảm bảo đúng route backend
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      return { ok: false, data: { message: "Lỗi kết nối" } };
    }
  },
};

export default groupService;
