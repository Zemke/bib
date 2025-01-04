const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const request = require('./request');
const book = require('./book');

const X = {books: []};

async function saveBook(id) {
  //const p = await request.get(
  //  "https://open.stadt-muenster.de/?id=" + id,
  //  {"content-type": "text/html,application/xhtml+xml,application/xml"},
  //);
  const p = fs.readFileSync('./detail.html', 'utf8');
  const b = book.parse(p);
  X.books.push(b);
  return Promise.resolve(b);
}

http.createServer(async (req, res) => {
  //const body = request.formData(await request.read(req));
  //const idOrLink = body["idOrLink"];
  const idOrLink = "0980443";
  const id = idOrLink.includes("/") ? url.parse(idOrLink, true).query.id : parseInt(idOrLink);
  const x = await saveBook(id);
  console.log(x)
  res.writeHeader(200, {"Content-Type": "text/html"});
  res.write(ejs.render(fs.readFileSync('./index.html', 'utf8'), {books: X.books}));
  res.end();
}).listen(8000);


