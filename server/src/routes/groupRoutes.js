import express from "express";
import verifyToken from "../middlewares/authMiddleware.js";
import {
  createBill,
  createGroup,
  getGroupDetails,
  getMyGroups,
} from "../controller/groupController.js";
import multer from "multer";
import { storage } from "../config/cloudinary.js";
import { getGroupSettings, updateGroup } from "../controller/groupController.js";

const router = express.Router();
const upload = multer({ storage });

router.post(
  "/create-group",
  verifyToken,
  upload.single("groupImage"),
  createGroup
);
router.get("/my-groups", verifyToken, getMyGroups);
router.get("/:id", verifyToken, getGroupDetails);
router.post("/bills/create", verifyToken, createBill);
router.get("/:id/settings", verifyToken, getGroupSettings);
router.put("/:id", verifyToken, upload.single("groupImage"), updateGroup);

export default router;
