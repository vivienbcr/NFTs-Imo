import { Application } from "express";
import { postMint, emulateProposal } from "./../controllers/fa2.controllers";
export default function exampleRoutes(app: Application) {
  app.route("/fa2/mint").post(postMint);
  app.route("/emulator/proposal").get(emulateProposal);
}
