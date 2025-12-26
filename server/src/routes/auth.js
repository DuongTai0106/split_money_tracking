import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  initRegister,
  completeRegister,
  updateProfile,
  changePassword,
} from "../controller/authController.js";
import verifyToken from "../middlewares/authMiddleware.js";
import multer from "multer";
import { storage } from "../config/cloudinary.js";

const noCache = (req, res, next) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
};
const router = express.Router();
const upload = multer({ storage });

router.post("/register", register);
router.post("/register-init", initRegister);
router.post("/register-complete", completeRegister);

router.post("/login", login);
router.post("/logout", logout);

router.get("/me", verifyToken, noCache, getProfile);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, upload.single("avatar"), updateProfile);
router.put("/change-password", verifyToken, changePassword);
export default router;
