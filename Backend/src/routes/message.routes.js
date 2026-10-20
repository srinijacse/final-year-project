import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/message.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.post("/", verifyJWT, sendMessage);
router.get("/:chatId", verifyJWT, getMessages);

export default router;
