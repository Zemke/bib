const http = require('http');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const request = require('./request');
const url = require('url');
const book = require('./book');

const port = 8000;
http.createServer(async (req, res) => {
  if (req.url === "/favicon.ico") {
    // favicon 404
    res.writeHead(404);
    res.end();
    return;
  }
  const worm_param = req.url.split("/").slice(-1)[0];
  const bookworm = book.worms
    .filter(w => w.toLowerCase() === worm_param.slice(0, w.length+1).toLowerCase())[0] || book.worms[0];
  if (req.url.split("/")[1] === "api") {
    // API
    if (book.worms.includes(req.url.split("/")[2])) {
      res.writeHead(200, {"Content-Type": "application/json"});
      res.write(JSON.stringify(book.X.books.filter(b => b.bookworms.includes(bookworm))));
      res.end();
    } else {
      res.writeHead(200, {"Content-Type": "application/json"});
      res.write(JSON.stringify(book.X));
      res.end();
    }
    return;
  } else if (req.method === "POST") {
    // add or delete book
    const body = request.formData(await request.read(req));
    if ("idOrLink" in body) {
      const idOrLink = body["idOrLink"];
      const id = idOrLink.includes("/") ? url.parse(idOrLink, true).query.data : idOrLink;
      try {
        await book.saveBook(id, bookworm);
      } catch (err) {
        console.error("couldn't load book", id, err);
      }
    } else if ("delete" in body) {
      const idx = book.X.books.findIndex(b => b.id == body["id"]);
      book.X.books[idx].bookworms = book.X.books[idx].bookworms.filter(bw => bw !== bookworm);
      if (!book.X.books[idx].bookworms.length) {
        book.X.books.splice(idx, 1);
      }
    }
  }
  if (req.url === "/" || book.worms.map(w => "/" + w).includes(req.url)) {
    // index
    const books = book.X.books
      .filter(b => b.bookworms.includes(bookworm))
      .sort((a, b) => b.added - a.added);
    const now = new Date();
    const openingHours = now.getHours() >= 6 && now.getHours() < 22;
    const shouldRefresh =
      (openingHours && now.getTime() - book.X.bookworms[bookworm].refresh >= 1000 * 60 * 15)
      || (!openingHours && now.getTime() - book.X.bookworms[bookworm].refresh >= 1000 * 60 * 60);
    if (shouldRefresh) {
      book.X.bookworms[bookworm].refresh = now.getTime();
      await Promise.all(books.map(b => book.refreshBook(b.id)));
    }
    const vars = {
      books,
      biblink: process.env.BIBLINK,
      bookworm,
      worms: book.worms,
      collapse: books.length > 4,
      opening: book.opening
    };
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(ejs.render(fs.readFileSync('./index.html', 'utf8'), vars));
    res.end();
    fs.writeFileSync(book.xfile, JSON.stringify(book.X));
    return;
  }
  res.writeHead(404);
  res.write("404");
  res.end();
}).listen(port);

console.log("http://localhost:" + port)

