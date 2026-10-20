import { Router } from "express";
import { accessChat, getChats } from "../controllers/chat.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.post("/", verifyJWT, accessChat);
router.get("/", verifyJWT, getChats);

export default router;
