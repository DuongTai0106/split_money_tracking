const API_URL = import.meta.env.VITE_API_URL;
const authService = {
  // Hàm gọi API check session
  checkAuth: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include", // <--- QUAN TRỌNG: Gửi kèm cookie
      });
      const data = await res.json();
      return { ok: res.ok, user: data.user };
    } catch (error) {
      return { ok: false };
    }
  },
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      return { ok: false, data: { message: "Lỗi kết nối server" } };
    }
  },

  register: async (username, email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      return { ok: false, data: { message: "Lỗi kết nối server" } };
    }
  },

  initRegister: async (username, email) => {
    try {
      const res = await fetch(`${API_URL}/auth/register-init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (e) {
      return { ok: false, data: { message: "Lỗi mạng" } };
    }
  },

  completeRegister: async (username, email, password, otp) => {
    try {
      const res = await fetch(`${API_URL}/auth/register-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Quan trọng để nhận Cookie đăng nhập luôn
        body: JSON.stringify({ username, email, password, otp }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (e) {
      return { ok: false, data: { message: "Lỗi mạng" } };
    }
  },

  logout: async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  },

  forgotPassword: async (email) => {
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (e) {
      return { ok: false, data: { message: "Lỗi mạng" } };
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (e) {
      return { ok: false, data: { message: "Lỗi mạng" } };
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (e) {
      return { ok: false, data: { message: "Lỗi mạng" } };
    }
  },

  getProfile: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "GET",
        credentials: "include", // Gửi cookie xác thực
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      return { ok: false, data: { message: "Lỗi kết nối server" } };
    }
  },

  updateProfile: async (formData) => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        credentials: "include",
        body: formData,
        // LƯU Ý: Không set 'Content-Type': 'multipart/form-data' thủ công
        // Fetch sẽ tự động làm việc đó kèm theo boundary khi body là FormData
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      return { ok: false, data: { message: "Lỗi kết nối server" } };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const res = await fetch(`${API_URL}/users/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      return { ok: res.ok, data };
    } catch (error) {
      return { ok: false, data: { message: "Lỗi kết nối server" } };
    }
  },
};

export default authService;
