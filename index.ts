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

app.get("/authors", async (req, res) => {
  let arrResponse = [];

  const getInfoAuthor = async ({ name }) => {
    let { data } = await axios(
      `https://quotes.toscrape.com/author/${name
        .replace(/ /, "-")
        .replace(/\. /g, "")}`
    );
    const dom = new JSDOM(data);
    let bornDate =
      dom.window.document.querySelector(`.author-born-date`).textContent;
    let bornLocation = dom.window.document.querySelector(
      `.author-born-location`
    ).textContent;
    let description =
      dom.window.document.querySelector(`.author-description`).textContent;
    arrResponse = arrResponse.concat({
      name,
      bornDate,
      bornLocation,
      description,
    });
  };

  for (let index = 1; index <= 10; index++) {
    let { data } = await axios.get(`https://quotes.toscrape.com/page/${index}`);
    const dom = new JSDOM(data);
    let nodeList = dom.window.document.querySelectorAll(`.author`);
    nodeList.forEach((element) => {
      getInfoAuthor({ name: element.innerHTML });
    });
  }

  res.send(arrResponse);
});

// app.get("/authors/:id", async (req, res) => {
//   let { id } = req.params;
//   let url = `https://quotes.toscrape.com/page/${id}`;
//   res.send(await getData({ url, clase: "author" }));
// });

// app.get("/quotes", async (req, res) => {
//   let arr = [];
//   let url = "https://quotes.toscrape.com/";
//   for (let index = 0; index < 10; index++) {
//     let arrForPage = await getData({ url, clase: "text" });
//     arr = arr.concat(arrForPage);
//   }
//   res.send(arr);
// });

// app.get("/quotes/:id", async (req, res) => {
//   let { id } = req.params;
//   let url = `https://quotes.toscrape.com/page/${id}`;
//   res.send(await getData({ url, clase: "text" }));
// });

server.listen(port, () => {
  console.log(messageExpressServer);
});

export default server;
