import { Application } from "express";
import {postMint} from "./../controllers/fa2.controllers"
export default function exampleRoutes(app : Application) {
  app.route("/fa2/mint").post(postMint);
}