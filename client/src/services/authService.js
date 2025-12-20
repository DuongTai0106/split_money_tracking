const API_URL = "http://localhost:5000/auth";

const authService = {
  // Hàm gọi API check session
  checkAuth: async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
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
      const res = await fetch(`${API_URL}/login`, {
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
      const res = await fetch(`${API_URL}/register`, {
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
      const res = await fetch(`${API_URL}/register-init`, {
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
      const res = await fetch(`${API_URL}/register-complete`, {
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
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
  },

  forgotPassword: async (email) => {
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
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
      const res = await fetch(`${API_URL}/verify-otp`, {
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
      const res = await fetch(`${API_URL}/reset-password`, {
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
};


export default authService;
