import express from 'express';

// rest of the code remains same
import  exampleRoutes  from "./routes/examples.routes"

(async () => {
  const app = express();
  const PORT = 8000;

  app.get('/', (req, res) => res.send('Express + TypeScript Server'));
  exampleRoutes(app);
  app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
  });
})()