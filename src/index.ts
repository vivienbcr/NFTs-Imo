import express from "express";
var bodyParser = require("body-parser");
// rest of the code remains same
import exampleRoutes from "./routes/examples.routes";
import fa2Routes from "./routes/fa2.routes";

(async () => {
  const app = express();
  const PORT = 8000;
  app.use(bodyParser.json());
  app.get("/", (req, res) => res.send("Express + TypeScript Server"));
  exampleRoutes(app);
  fa2Routes(app);
  app.listen(PORT, () => {
    console.log(
      `⚡⚡⚡[server]: Server is running at https://localhost:${PORT}`
    );
  });
})();
