import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshToken,
  register,
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/authMiddleware";

const authRoute = Router();

authRoute.post("/register", register);

authRoute.post("/login", loginUser);

authRoute.get("/refresh", refreshToken);

authRoute.get("/logout", verifyToken, logoutUser);

export default authRoute;
