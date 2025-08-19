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

routes
  .route("/create-service")
  .post(isAuthenticated, singleUploaded.single("coverImage"), createService);
routes.route("/get-service").get(isAuthenticated, getService);
routes.route("/get-service/:id").get(isAuthenticated, getSingleService);
routes
  .route("/update-service/:id")
  .put(isAuthenticated, singleUploaded.single("coverImage"), updateService);
routes.route("/delete-service/:id").delete(isAuthenticated, deleteService);

export default routes;
