import { Router } from "express";
import { isAuthenticated } from "../middlewares/authenticate.js";
import {
  createService,
  deleteService,
  getService,
  getSingleService,
  updateService,
} from "../controller/service.controler.js";

const routes = Router();

routes.route("/create-service").post(createService);
routes.route("/get-service").post(getService);
routes.route("/get-service/:id").post(getSingleService);
routes.route("/update-service/:id").post(updateService);
routes.route("/delete-service/:id").post(deleteService);

export default routes;
