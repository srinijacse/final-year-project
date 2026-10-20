import { Router } from "express";
import {
  getAssessmentQuestions,
  submitAssessment,
  getAssessmentHistory,
} from "../controllers/assessment.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.get("/questions/:skill", verifyJWT, getAssessmentQuestions);
router.post("/submit", verifyJWT, submitAssessment);
router.get("/history", verifyJWT, getAssessmentHistory);

export default router;
