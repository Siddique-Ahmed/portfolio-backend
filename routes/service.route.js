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

routes.route("/create-service").post(isAuthenticated, createService);
routes.route("/get-service").post(isAuthenticated, getService);
routes.route("/get-service/:id").post(isAuthenticated, getSingleService);
routes.route("/update-service/:id").post(isAuthenticated, updateService);
routes.route("/delete-service/:id").post(isAuthenticated, deleteService);


export default routes