const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const request = require('./request');
const book = require('./book');

const X = {books: []};
const LINK = "https://open.stadt-muenster.de";

async function saveBook(id, bookworm) {
  const existing = X.books.find(b => b.id === id);
  if (existing != null) {
    if (!existing.bookworms.includes(bookworms)) {
      existing.bookworms.push(bookworm);
    }
    return;
  }
  //const p = await request.get(
  //  LINK + "/?id=" + id,
  //  {"content-type": "text/html,application/xhtml+xml,application/xml"},
  //);
  const p = fs.readFileSync('./detail.html', 'utf8');
  const b = book.parse(p);
  b.bookworms = [bookworm];
  X.books.push(b);
  return Promise.resolve(b);
}

function requestBook(id) {
  return request.get(
    LINK + "/?id=" + id,
    {"content-type": "text/html,application/xhtml+xml,application/xml"},
  )
    .catch(err => {
      const idx = X.books.findIndex(b => b.id = id);
      if (idx != null && idx !== -1) {
        X.books[idx].attempt = Date.now();
      }
      throw err;
    });
}

async function refresh(id) {
  const idx = X.books.findIndex(b => b.id === id);
  if (idx == null || idx === -1) {
    throw new Error(`book ${id} not known`);
  }
  const now = new Date();
  const openingHours = now.getHours() >= 6 && now.getHours() <= 22;
  const shouldRefresh =
    (openingHours && now.getTime() - X.books[idx].attempt >= 1000 * 60 * 15)
    || (!openingHours && now.getTime() - X.books[idx].attempt >= 1000 * 60 * 60);
  if (shouldRefresh) {
    const n = book.parse(await requestBook(id));
    book.update(X.books[idx], n);
  } else {
    return Promise.resolve(X.books[idx]);
  }
}

http.createServer(async (req, res) => {
  const bookworm = "FLORI"; // TODO
  if (req.method === "POST") {
    const body = request.formData(await request.read(req));
    if ("idOrLink" in body) {
      const idOrLink = body["idOrLink"];
      const id = idOrLink.includes("/") ? url.parse(idOrLink, true).query.id : parseInt(idOrLink);
      await saveBook(id, bookworm);
    } else if ("delete" in body) {
      const idx = X.books.findIndex(b => b.id == body["id"]);
      X.books[idx].bookworms = X.books[idx].bookworms.filter(bw => bw !== bookworm);
      if (!X.books[idx].bookworms.length) {
        X.books.splice(idx, 1);
      }
    }
  }
  X.books.sort((a,b) => b.added - a.added).splice(0, 3).forEach(b => refresh(b.id));
  res.writeHeader(200, {"Content-Type": "text/html"});
  const vars = {
    books: X.books,
    biblink: LINK,
    bookworm,
    collapse: X.books.length > 4 && bookworm !== "FLORI",
    opening: "https://www.stadt-muenster.de/buecherei/orte-und-oeffnungszeiten",
  };
  res.write(ejs.render(fs.readFileSync('./index.html', 'utf8'), vars));
  res.end();
}).listen(8000);


