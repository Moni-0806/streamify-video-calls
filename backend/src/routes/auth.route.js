import express from "express";
import {
  changePassword,
  login,
  logout,
  onboard,
  submitFeedback,
  signup,
  updateProfilePrivacy,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/onboarding", protectRoute, onboard);
router.post("/change-password", protectRoute, changePassword);
router.patch("/privacy", protectRoute, updateProfilePrivacy);
router.post("/feedback", protectRoute, submitFeedback);

// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
