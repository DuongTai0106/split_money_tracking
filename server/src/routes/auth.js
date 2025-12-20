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
} from "../controller/authController.js";
import verifyToken from "../middlewares/authMiddleware.js";
const noCache = (req, res, next) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
};
const router = express.Router();

router.post("/register", register);
router.post("/register-init", initRegister);
router.post("/register-complete", completeRegister);

router.post("/login", login);
router.post("/logout", logout);

router.get("/me", verifyToken, noCache, getProfile);

router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
