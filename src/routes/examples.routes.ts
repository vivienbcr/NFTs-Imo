import { Application } from "express";
import {exampleController} from "./../controllers/examples.controllers"
export default function exampleRoutes(app : Application) {
  app.route("/examples").get(exampleController);
}