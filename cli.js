const book = require('./book');

const bookworm = process.env.WORMS.split(",")[0];

(async () => {
  if (process.argv.length === 4 && process.argv[2] === 'add') {
    await book.add(book.idOrLink(process.argv[3]), bookworm);
  } else if (process.argv.length === 4 && process.argv[2] === 'rm') {
    book.rm(process.argv[3], bookworm);
  }
  const books = await book.index(bookworm);
  //console.log(JSON.stringify(books, 2, 2));
  const status = {
    "Verfügbar": "🟢",
    "Transport": "🚚",
    "Entliehen": "🟥",
    "Reparatur": "🔧",
    "Vorbestellt": "⭕️",
    "_": "🟡",
  };
  const earliestFristFn = b =>
    Object.values(b.avails)
      .flat()
      .map(a => a.frist)
      .map(f => f || '0')
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
            a.frist || '',
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

