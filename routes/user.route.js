import { Router } from "express";
import {
  verificationCode,
  getuserProfile,
  loginUser,
  logout,
} from "../controller/user.controller.js";
import { isAuthenticated } from "../middlewares/authenticate.js";

const routes = Router();

routes.route("/login").post(loginUser);
routes.route("/login").post(logout);
routes.route("/generate-code").post(verificationCode);
routes.route("/get-profile").get(isAuthenticated, getuserProfile);

export default routes;
