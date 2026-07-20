const http = require('http');
const path = require('path');
const fs = require('fs');
const request = require('./request');
const book = require('./book_ol');

const xfile = path.join(__dirname, "x.json");
const worms = process.env.WORMS == null
  ? ["asdf"]
  : process.env.WORMS.split(",")
if (!fs.existsSync(xfile)) {
  fs.writeFileSync(
    xfile,
    JSON.stringify({
      books: [],
      bookworms: worms.reduce((acc, v) => {
        acc[v] = {refresh: -1};
        return acc;
      }, {})
    }));
}
const X = JSON.parse(fs.readFileSync(xfile, 'utf8'));

function requestBook(id) {
  if (process.env.MOCK !== "0") {
    return new Promise((resolve, _) => {
      setTimeout(() => resolve(fs.readFileSync('./detail.html', 'utf8')), 2000);
    });
  }
  return request.get(
    process.env.BIBLINK + "/webopac/detail.aspx?Id=" + id,
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
  const b = book.parse(await requestBook(id), id);
  b.bookworms = [bookworm];
  X.books.push(b);
  return Promise.resolve(b);
}

async function refreshBook(id) {
  console.info('refreshing', id);
  try {
    return book.update(
      X.books.find(b => b.id === id),
      book.parse(await requestBook(id), id)
    );
  } catch (err) {
    console.error("couldn't refresh book", id, err);
  }
}

module.exports.xfile = xfile;
module.exports.worms = worms;
module.exports.X = X;
module.exports.refreshBook = refreshBook;
module.exports.saveBook = saveBook;

module.exports.parse = book.parse;
module.exports.update = book.update;
module.exports.opening = book.opnening;

