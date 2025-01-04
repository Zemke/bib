const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const request = require('./request');
const book = require('./book');

const X = {books: []};
const LINK = "https://open.stadt-muenster.de";

async function saveBook(id, bookworm) {
  //const p = await request.get(
  //  LINK + "/?id=" + id,
  //  {"content-type": "text/html,application/xhtml+xml,application/xml"},
  //);
  const p = fs.readFileSync('./detail.html', 'utf8');
  const b = book.parse(p);
  b.bookworm = [bookworm]; // TODO book exists in X.books? (maybe just add bookworm)
  X.books.push(b);
  return Promise.resolve(b);
}

http.createServer(async (req, res) => {
  const bookworm = "FLORI"; // TODO
  if (req.method === "POST") {
    const body = request.formData(await request.read(req));
    console.log(body);
    if ("idOrLink" in body) {
      const idOrLink = body["idOrLink"];
      const id = idOrLink.includes("/") ? url.parse(idOrLink, true).query.id : parseInt(idOrLink);
      await saveBook(id, bookworm);
    } else if ("delete" in body) {
      X.books.splice(X.books.findIndex(b => b.id == body["id"]), 1);
    }
  }
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


