const fs = require('fs');
const url = require('url');
const request = require('./request');
const book = require('./book');

const bookworm = "FLORI";
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
  try {
    return book.update(
      X.books.find(b => b.id === id),
      book.parse(await requestBook(id))
    );
  } catch (err) {
    console.error("couldn't refresh book", id, err);
  }
}

(async () => {
  if (process.argv.length === 4 && process.argv[2] === 'add') {
    const idOrLink = process.argv[3];
    const id = idOrLink.includes("/") ? url.parse(idOrLink, true).query.id : idOrLink;
    try {
      await saveBook(id, bookworm);
    } catch (err) {
      console.error("couldn't load book", id, err);
    }
  } else if (process.argv.length === 4 && process.argv[2] === 'rm') {
    const idx = X.books.findIndex(b => b.id == process.argv[3]);
    X.books[idx].bookworms = X.books[idx].bookworms.filter(bw => bw !== bookworm);
    if (!X.books[idx].bookworms.length) {
      X.books.splice(idx, 1);
    }
  }
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
  fs.writeFileSync('x.json', JSON.stringify(X));
  //console.log(JSON.stringify(books, 2, 2));
  const status = {
    "Verfügbar": "🟢",
    "Transport": "🚚",
    "Entliehen": "🟥",
    "Reparatur": "🔧",
    "_": "🟡",
  };
  const earliestFristFn = b =>
    Object.values(b.avails)
      .flat()
      .map(a => a.frist)
      .filter(f => f)
      .map(f => f.split(".").reverse().join("-"))
      .map(f => Date.parse(f))
      .sort((f1, f2) => f1 - f2)[0] || -1;
  let upd = null;
  books
    .sort((b1, b2) => earliestFristFn(b1) - earliestFristFn(b2))
    .forEach(b => {
      console.log(
        b.status in status ? status[b.status] : b.status,
        `\x1b[1m${b.name}\x1b[0m`
      );
      console.log(b.id);
      upd = upd == null || b.updated < upd ? b.updated : upd;
      b.buechereien.forEach(bu => {
        console.log(bu);
        b.avails[bu].forEach(a => {
          console.log(
            a.status in status ? status[a.status] : a.status,
            a.frist,
            a.standort,
            a.vorbestellungen !== "0" ? `\x1b[31m (${a.vorbestellungen}) \x1b[0m` : ''
          );
        });
      });
      console.log();
    });
  console.log(
    new Date(upd).toLocaleString('de'),
    Math.floor((Date.now() - upd) / 1000 / 60, 5),
    (Date.now() - upd) / 1000 / 60 < 15 ? '✅' : '⛔️'
  );
})();

