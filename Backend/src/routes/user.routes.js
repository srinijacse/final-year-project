import { Router } from "express";
import {
  UserDetails,
  userDetailsWithoutID,
  updateProfile,
  discoverUsers,
  addTeachingSkill,
  removeTeachingSkill,
  addLearningSkill,
  removeLearningSkill,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

// Profile retrieval
router.get("/registered/getDetails", verifyJWT, userDetailsWithoutID);
router.get("/registered/getDetails/:username", verifyJWT, UserDetails);
router.get("/me", verifyJWT, userDetailsWithoutID);

// Profile updates
router.post("/updateProfile", verifyJWT, updateProfile);
router.post("/registered/saveRegDetails", verifyJWT, updateProfile);
router.post("/registered/saveEduDetail", verifyJWT, updateProfile);
router.post("/registered/saveAddDetail", verifyJWT, updateProfile);

// Skills management
router.post("/teaching-skills", verifyJWT, addTeachingSkill);
router.delete("/teaching-skills/:skillName", verifyJWT, removeTeachingSkill);
router.post("/learning-skills", verifyJWT, addLearningSkill);
router.delete("/learning-skills/:skillName", verifyJWT, removeLearningSkill);

// Discover users
router.get("/discover", verifyJWT, discoverUsers);

export default router;
