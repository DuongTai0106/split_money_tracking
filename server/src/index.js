import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import groupRoutes from "./routes/groupRoutes.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1); // render/proxy (khuyến nghị)

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://split-money-tracking.vercel.app",
]);

const corsOptions = {
  origin: (origin, cb) => {
    // origin có thể undefined (curl/mobile)
    if (!origin) return cb(null, true);

    // cho phép tất cả preview domain của Vercel: https://xxx.vercel.app
    const isVercelPreview = /^https:\/\/.+\.vercel\.app$/.test(origin);

    if (allowedOrigins.has(origin) || isVercelPreview) return cb(null, true);

    console.log("Blocked by CORS:", origin);
    return cb(null, false); // ❗đừng cb(new Error(...)) vì sẽ trả response không có CORS header
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

app.get("/ping", (req, res) => res.send("pong"));

const io = new Server(server, { cors: corsOptions });

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("join-group", (groupId) => socket.join(`group_${groupId}`));
});

app.set("io", io);

app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
