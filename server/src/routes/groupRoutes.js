import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import { createGroup, getMyGroups } from "../controller/groupController.js";
import multer from "multer";
import { storage } from "../config/cloudinary.js";

const router = express.Router();
const upload = multer({ storage });

router.post(
  "/create-group",
  verifyToken,
  upload.single("groupImage"),
  createGroup
);
router.get("/my-groups", verifyToken, getMyGroups);

export default router;
