import { Router } from "express";
import {
  createRequest,
  getRequests,
  getOutgoingRequests,
  getConnections,
  acceptRequest,
  rejectRequest,
  cancelRequest,
} from "../controllers/request.controllers.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.post("/create", verifyJWT, createRequest);
router.get("/getRequests", verifyJWT, getRequests);
router.get("/outgoing", verifyJWT, getOutgoingRequests);
router.get("/connections", verifyJWT, getConnections);
router.post("/acceptRequest", verifyJWT, acceptRequest);
router.post("/rejectRequest", verifyJWT, rejectRequest);
router.delete("/cancel/:requestId", verifyJWT, cancelRequest);

export default router;
