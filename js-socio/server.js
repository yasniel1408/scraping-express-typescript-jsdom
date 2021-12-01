const axios = require("axios");

const jsdom = require("jsdom");

const express = require("express");

const createService = () => {
  const app = express();

  const getJSONResponse = (data) => ({ data });

  const baseUrl = process.env.BASE_URL || "https://quotes.toscrape.com";

  const cachedData = {
    lastModifiedDate: null,
    data: {
      quotes: [],
      authors: [],
    },
  };

  const setCachedQuotes = (quotes) => {
    cachedData.lastModifiedDate = new Date();
    cachedData.data.quotes = quotes;
  };

  const setCachedAuthors = (authors) => {
    cachedData.lastModifiedDate = new Date();
    cachedData.data.authors = authors;
  };

  const isValidCache = () => {
    if (!cachedData.lastModifiedDate) return false;

    const lastModifiedDate = cachedData.lastModifiedDate;
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastModifiedDate);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));

    return diffMinutes < 0;
  };

  const getDom = async (url) => {
    const { data } = await axios.get(baseUrl + url);
    const dom = new jsdom.JSDOM(data);

    return dom.window.document;
  };

  const getData = async () => {
    if (isValidCache()) return cachedData.data;

    const quotes = [];
    const authors = [];
    const authorsUrls = new Set();

    // TODO: change to be dynamically
    const quotesPagesDom = await Promise.all([
      getDom("/page/1"),
      getDom("/page/2"),
      getDom("/page/3"),
      getDom("/page/4"),
      getDom("/page/5"),
      getDom("/page/6"),
      getDom("/page/7"),
      getDom("/page/8"),
      getDom("/page/9"),
      getDom("/page/10"),
    ]);

    for (const pageDom of quotesPagesDom) {
      const quotesDom = pageDom.querySelectorAll(".quote");
      for (const quoteDom of quotesDom) {
        const text = quoteDom
          .querySelector(".text")
          .textContent.trim()
          .slice(0, 50);
        const author = quoteDom.querySelector("small.author").textContent;
        const tags = [];
        quoteDom.querySelectorAll(".tag").forEach((tag) => {
          tags.push(tag.textContent);
        });
        const authorUrl = quoteDom.querySelector("[href]").href;
        authorsUrls.add(authorUrl);

        quotes.push({
          text,
          author,
          tags,
        });
      }
    }

    setCachedQuotes(quotes);

    const pagesDomFunctions = [];
    authorsUrls.forEach((url) => {
      pagesDomFunctions.push(getDom(url));
    });
    const authorsPagesDom = await Promise.all(pagesDomFunctions);

    for (const pageDom of authorsPagesDom) {
      const name = pageDom.querySelector(".author-title").textContent;
      // const birthdate = pageDom.querySelector(".author-born-date").textContent;
      // const location = pageDom.querySelector(
      //   ".author-born-location"
      // ).textContent;
      // const biography = pageDom
      //   .querySelector("div.author-description")
      //   .textContent.trim()
      //   .slice(0, 50);

      authors.push({
        name,
        // birthdate,
        // biography,
        // location,
      });
    }

    setCachedAuthors(authors);

    return { quotes, authors };
  };

  app.get("/quotes", async (req, res) => {
    const { tag, author } = req.query;
    const data = await getData();
    let quotes;

    if (!tag && !author) {
      quotes = data.quotes;
    }

    if (author && !tag) {
      const allQuotes = data.quotes;
      quotes = allQuotes.filter((qu) => qu.author === author);
    }

    if (tag && !author) {
      const allQuotes = data.quotes;
      quotes = allQuotes.filter((qu) => qu.tags.includes(tag));
    }

    return res.send(getJSONResponse(quotes));
  });

  app.get("/authors", async (req, res) => {
    const { name } = req.query;
    const data = await getData();
    let authors;

    if (!name) {
      authors = data.authors;
    }

    if (name) {
      const allAuthors = data.authors;
      authors = allAuthors.filter((aut) => aut.name === name);
    }

    return res.send(getJSONResponse(authors.length));
  });

  return app;
};

module.exports = { createService };
