import express from "express";
import * as http from "http";
import cors from "cors";
import axios from "axios";
import { JSDOM } from "jsdom";

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const messageExpressServer: string = `Server is listening on ${port}`;

app.get("/", (req, res) => {
  res.send(messageExpressServer);
});

const getData = async ({ url, clase }) => {
  let arr = [];
  let { data } = await axios.get(url);
  const dom = new JSDOM(data);
  let list = dom.window.document.querySelectorAll(`.${clase}`);
  list.forEach((element) => {
    arr.push({ [clase]: element.innerHTML });
  });
  return arr;
};

app.get("/quotes", async (req, res) => {
  let arr = [];
  let url = "https://quotes.toscrape.com/";
  for (let index = 0; index < 10; index++) {
    let arrForPage = await getData({ url, clase: "text" });
    arr = arr.concat(arrForPage);
  }
  res.send(arr);
});

app.get("/quotes/:id", async (req, res) => {
  let { id } = req.params;
  let url = `https://quotes.toscrape.com/page/${id}`;
  res.send(await getData({ url, clase: "text" }));
});

app.get("/authors", async (req, res) => {
  let arr = [];
  let url = "https://quotes.toscrape.com/author";
  for (let index = 0; index < 10; index++) {
    let arrForPage = await getData({ url, clase: "author" });
    arr = arr.concat(arrForPage);
  }
  res.send(arr);
});

app.get("/authors/:id", async (req, res) => {
  let { id } = req.params;
  let url = `https://quotes.toscrape.com/page/${id}`;
  res.send(await getData({ url, clase: "author" }));
});

server.listen(port, () => {
  console.log(messageExpressServer);
});

export default server;
