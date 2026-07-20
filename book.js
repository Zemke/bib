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
    process.env.BIBLINK + book.detail + id,
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

function rm(id, bookworm) {
  const idx = X.books.findIndex(b => b.id == id);
  X.books[idx].bookworms = X.books[idx].bookworms.filter(bw => bw !== bookworm);
  if (!X.books[idx].bookworms.length) {
    X.books.splice(idx, 1);
  }
}

async function add(id, bookworm) {
  try {
    await saveBook(id, bookworm);
  } catch (err) {
    console.error("couldn't load book", id, err);
  }
}

async function index(bookworm) {
  const books = X.books
    .filter(b => b.bookworms.includes(bookworm))
    .sort((a, b) => b.added - a.added);
  const now = new Date();
  const openingHours = now.getHours() >= 6 && now.getHours() < 22;
  const shouldRefresh =
    process.argv.includes("--force")
    || (openingHours && now.getTime() - X.bookworms[bookworm].refresh >= 1000 * 60 * 15)
    || (!openingHours && now.getTime() - X.bookworms[bookworm].refresh >= 1000 * 60 * 60);
  if (shouldRefresh) {
    X.bookworms[bookworm].refresh = now.getTime();
    await Promise.all(books.map(b => refreshBook(b.id)));
  }
  fs.writeFileSync(xfile, JSON.stringify(X));
  return books;
}

module.exports.xfile = xfile;
module.exports.worms = worms;
module.exports.X = X;
module.exports.refreshBook = refreshBook;
module.exports.saveBook = saveBook;
module.exports.rm = rm;
module.exports.add = add;
module.exports.index = index;

module.exports.parse = book.parse;
module.exports.update = book.update;
module.exports.opening = book.opening;
module.exports.idOrLink = book.idOrLink;

