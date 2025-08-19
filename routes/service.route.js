import { Router } from "express";
import { isAuthenticated } from "../middlewares/authenticate.js";
import {
  createService,
  deleteService,
  getService,
  getSingleService,
  updateService,
} from "../controller/service.controler.js";
import { singleUploaded } from "../middlewares/multer.js";

const routes = Router();

routes.route("/create-service").post(singleUploaded.single("coverImage"),createService);
routes.route("/get-service").get(getService);
routes.route("/get-service/:id").get(getSingleService);
routes.route("/update-service/:id").put(singleUploaded.single("coverImage"),updateService);
routes.route("/delete-service/:id").delete(deleteService);

export default routes;
