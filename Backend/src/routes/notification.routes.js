import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  clearNotifications,
} from "../controllers/notification.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.get("/", verifyJWT, getNotifications);
router.put("/read/:notificationId", verifyJWT, markAsRead);
router.delete("/clear", verifyJWT, clearNotifications);

export default router;
