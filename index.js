const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const request = require('./request');
const book = require('./book');
const url = require('url');

if (!fs.existsSync('x.json')) {
  fs.writeFileSync(
    'x.json',
    JSON.stringify({
      books: [],
      bookworms: {
        FLORI: {refresh: -1},
        LEA: {refresh: -1},
      }
    }));
}
const X = JSON.parse(fs.readFileSync('x.json', 'utf8'));

function requestBook(id) {
  if (process.env.MOCK !== "0") {
    return new Promise((resolve, _) => {
      setTimeout(() => resolve(fs.readFileSync('./detail.html', 'utf8')), 2000);
    });
  }
  return request.get(
    process.env.BIBLINK + "/?id=" + id,
    {"content-type": "text/html,application/xhtml+xml,application/xml"},
  );
}

async function saveBook(id, bookworm) {
  const existing = X.books.find(b => b.id === id);
  if (existing != null) {
    if (!existing.bookworms.includes(bookworm)) {
      existing.bookworms.push(bookworm);
    }
    return;
  }
  const b = book.parse(await requestBook(id));
  b.bookworms = [bookworm];
  X.books.push(b);
  return Promise.resolve(b);
}

async function refreshBook(id) {
  console.info('refreshing', id);
  try {
    return book.update(
      X.books.find(b => b.id === id),
      book.parse(await requestBook(id))
    );
  } catch (err) {
    console.error("couldn't refresh book", id, err);
  }
}

http.createServer(async (req, res) => {
  if (req.url === "/favicon.ico") {
    // favicon 404
    res.writeHead(404);
    res.end();
    return;
  }
  const bookworm = req.url.endsWith("/flori") ? "FLORI" : "LEA";
  if (req.url.split("/")[1] === "api") {
    // API
    if (["flori", "lea"].includes(req.url.split("/")[2])) {
      res.writeHead(200, {"Content-Type": "application/json"});
      res.write(JSON.stringify(X.books.filter(b => b.bookworms.includes(bookworm))));
      res.end();
    } else {
      res.writeHead(200, {"Content-Type": "application/json"});
      res.write(JSON.stringify(X));
      res.end();
    }
    return;
  } else if (req.method === "POST") {
    // add or delete book
    const body = request.formData(await request.read(req));
    if ("idOrLink" in body) {
      const idOrLink = body["idOrLink"];
      const id = idOrLink.includes("/") ? url.parse(idOrLink, true).query.id : idOrLink;
      try {
        await saveBook(id, bookworm);
      } catch (err) {
        console.error("couldn't load book", id, err);
      }
    } else if ("delete" in body) {
      const idx = X.books.findIndex(b => b.id == body["id"]);
      X.books[idx].bookworms = X.books[idx].bookworms.filter(bw => bw !== bookworm);
      if (!X.books[idx].bookworms.length) {
        X.books.splice(idx, 1);
      }
    }
  }
  if (req.url === "/" || req.url === "/flori" || req.url === "/lea") {
    // index
    const books = X.books
      .filter(b => b.bookworms.includes(bookworm))
      .sort((a, b) => b.added - a.added);
    const now = new Date();
    const openingHours = now.getHours() >= 6 && now.getHours() < 22;
    const shouldRefresh =
      (openingHours && now.getTime() - X.bookworms[bookworm].refresh >= 1000 * 60 * 15)
      || (!openingHours && now.getTime() - X.bookworms[bookworm].refresh >= 1000 * 60 * 60);
    if (shouldRefresh) {
      X.bookworms[bookworm].refresh = now.getTime();
      await Promise.all(books.map(b => refreshBook(b.id)));
    }
    const vars = {
      books,
      biblink: process.env.BIBLINK,
      bookworm,
      collapse: books.length > 4 && bookworm !== "FLORI",
      opening: "https://www.stadt-muenster.de/buecherei/orte-und-oeffnungszeiten",
    };
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(ejs.render(fs.readFileSync('./index.html', 'utf8'), vars));
    res.end();
    fs.writeFileSync('x.json', JSON.stringify(X));
    return;
  }
  res.writeHead(404);
  res.write("404");
  res.end();
}).listen(8000);

