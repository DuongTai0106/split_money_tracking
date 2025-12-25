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

export default router;
