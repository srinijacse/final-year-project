import { Router } from "express";
import {
  register,
  login,
  handleLogout,
  getMe,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", handleLogout);
router.get("/me", verifyJWT, getMe);

export default router;