import { Router } from "express";
import {
  deleteMail,
  getMail,
  getMailById,
  sentMail,
} from "../controller/contact.controller.js";
import { isAuthenticated } from "../middlewares/authenticate.js";

const routes = Router();

routes.route("/sent-mail").post(sentMail);
routes.route("/get-mail").get(getMail);
routes.route("/get-mail/:id").get(getMailById);
routes.route("/delete-mail/:id").delete(deleteMail);

export default routes;
