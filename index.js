const http = require('http');
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
    res.writeHead(200, {"Content-Type": "application/json"});
    if (book.worms.includes(req.url.split("/")[2])) {
      res.write(JSON.stringify(book.X.books.filter(b => b.bookworms.includes(bookworm))));
    } else {
      res.write(JSON.stringify(book.X));
    }
    res.end();
    return;
  } else if (req.method === "POST") {
    // add or delete book
    const body = request.formData(await request.read(req));
    if ("idOrLink" in body) {
      await book.add(book.idOrLink(body["idOrLink"]), bookworm);
    } else if ("delete" in body) {
      book.rm(body["id"], bookworm);
    }
  }
  if (req.url === "/" || book.worms.map(w => "/" + w).includes(req.url)) {
    // index
    const books = await book.index(bookworm);
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
    return;
  }
  res.writeHead(404);
  res.write("404");
  res.end();
}).listen(port);

console.log("http://localhost:" + port)

