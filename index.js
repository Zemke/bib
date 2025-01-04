const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const request = require('./request');
const book = require('./book');

if (!fs.existsSync('x.json')) {
  fs.writeFileSync('x.json', JSON.stringify({books: []}));
}
const X = JSON.parse(fs.readFileSync('x.json', 'utf8'));

const LINK = "https://open.stadt-muenster.de";
const mock = true;

function requestBook(id) {
  if (mock) {
    return fs.readFileSync('./detail.html', 'utf8');
  }
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

async function saveBook(id, bookworm) {
  const existing = X.books.find(b => b.id === id);
  if (existing != null) {
    if (!existing.bookworms.includes(bookworms)) {
      existing.bookworms.push(bookworm);
    }
    return;
  }
  const b = book.parse(requestBook(id));
  b.bookworms = [bookworm];
  X.books.push(b);
  return Promise.resolve(b);
}

async function refreshBook(id) {
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
    return Promise.resolve(true);
  } else {
    return Promise.resolve(false);
  }
}

http.createServer(async (req, res) => {
  const bookworm = req.url.endsWith("/flori") ? "FLORI" : "LEA";
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
  // TODO show only three latest added initially
  books = X.books.filter(b => b.bookworms.includes(bookworm));
  books.forEach(b => refreshBook(b.id));
  res.writeHeader(200, {"Content-Type": "text/html"});
  const vars = {
    books: books.sort((a,b) => b.added - a.added),
    biblink: LINK,
    bookworm,
    collapse: X.books.length > 4 && bookworm !== "FLORI",
    opening: "https://www.stadt-muenster.de/buecherei/orte-und-oeffnungszeiten",
  };
  res.write(ejs.render(fs.readFileSync('./index.html', 'utf8'), vars));
  res.end();
  fs.writeFileSync('x.json', JSON.stringify(X));
}).listen(8000);


