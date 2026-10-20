import { Router } from "express";
import { analyzeAndVerifyPortfolio } from "../controllers/portfolio.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.post("/verify", verifyJWT, analyzeAndVerifyPortfolio);

export default router;
