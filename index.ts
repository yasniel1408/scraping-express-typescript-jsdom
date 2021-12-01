import express from "express";
import * as http from "http";
import cors from "cors";

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const messageExpressServer = `Server is listening on ${port}`;

app.get("/", (req, res) => {
  res.send(messageExpressServer);
});

server.listen(port, () => {
  console.log(messageExpressServer);
});

export default server;
