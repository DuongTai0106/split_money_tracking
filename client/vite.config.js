import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate", // Tự động cập nhật khi bạn deploy code mới
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Bill Tracking",
        short_name: "Bill Tracking",
        description: "Ứng dụng chia bill cho nhóm",
        theme_color: "#1a1715", // Màu thanh status bar trên điện thoại
        background_color: "#1a1715", // Màu nền lúc khởi động app
        display: "standalone", // Chế độ hiển thị full màn hình (không còn thanh URL)
        scope: "/",
        start_url: "/",
        orientation: "portrait", // Khóa chiều dọc (tùy chọn)
        icons: [
          {
            src: "pwa-192x192.svg", // Đảm bảo bạn đã bỏ ảnh vào thư mục public
            sizes: "192x192",
            type: "image/svg",
          },
          {
            src: "pwa-512x512.svg",
            sizes: "512x512",
            type: "image/svg",
          },
        ],
      },
    }),
  ],
  server: {
    allowedHosts: true,
  },
});
