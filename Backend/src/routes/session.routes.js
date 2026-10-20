import { Router } from "express";
import {
  createSession,
  getUserSessions,
  acceptSession,
  rejectSession,
  completeSession,
  cancelSession,
} from "../controllers/session.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.post("/create", verifyJWT, createSession);
router.get("/mySessions", verifyJWT, getUserSessions);
router.put("/accept/:sessionId", verifyJWT, acceptSession);
router.put("/reject/:sessionId", verifyJWT, rejectSession);
router.put("/complete/:sessionId", verifyJWT, completeSession);
router.put("/cancel/:sessionId", verifyJWT, cancelSession);

export default router;
