import { Router } from "express";
import { rateUser, getUserRatings } from "../controllers/rating.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.post("/rate", verifyJWT, rateUser);
router.post("/rateUser", verifyJWT, rateUser); // Compatibility alias
router.get("/user/:username", getUserRatings);

export default router;
