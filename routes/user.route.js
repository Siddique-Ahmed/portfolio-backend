import { Router } from "express";
import {
  verificationCode,
  getuserProfile,
  loginUser,
  logout,
  updateProfile,
} from "../controller/user.controller.js";
import { isAuthenticated } from "../middlewares/authenticate.js";
import { singleUploaded } from "../middlewares/multer.js";

const routes = Router();

routes.route("/login").post(loginUser);
routes.route("/generate-code").post(verificationCode);
routes
  .route("/update-profile")
  .put(isAuthenticated, singleUploaded.single("profilePic"), updateProfile);
routes.route("/get-profile").get(isAuthenticated, getuserProfile);
routes.route("/logout").post(isAuthenticated, logout);

export default routes;
