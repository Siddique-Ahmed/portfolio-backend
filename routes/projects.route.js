import { Router } from "express";
import {
  createProjects,
  deleteProjects,
  getProjects,
  getSingleProjects,
  updateProjects,
} from "../controller/project.controller.js";
import { singleUploaded } from "../middlewares/multer.js";

const routes = Router();

routes
  .route("/create-project")
  .post(singleUploaded.single("projectImg"), createProjects);
routes.route("/get-project").get(getProjects);
routes.route("/get-project/:id").get(getSingleProjects);
routes
  .route("/update-project/:id")
  .put(singleUploaded.single("projectImg"), updateProjects);
routes.route("/delete-project/:id").delete(deleteProjects);

export default routes;
