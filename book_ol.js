const fs = require('fs');
const jsdom = require("jsdom");
const url = require('url')

// WinBIAP WebOPAC

function parse(D, id) {
  const J = new jsdom.JSDOM(D).window.document;
  const cc = Array.from(J.querySelectorAll("td.cellMediaItemStatus"))
    .map(el => el.textContent.trim())
  const status = toStatus(cc.join("").toLowerCase());
  const elem = J.getElementById("detail-center");
  const content = Array.from(elem.querySelectorAll('.DetailInformationEntryContent'))
    .map(el => el.textContent.trim())
  const name = Array.from(elem.querySelectorAll('.DetailInformationEntryName'))
    .map(el => el.textContent.trim())
  const detail = name.reduce((acc, v, i, a) => {
    if (v.includes("Erschienen")) {
      acc["_release"] = content[i].match(/(20|19|18)\d\d/)[0]
    }
    acc[v.slice(0, -1)] = content[i]
    return acc;
  }, {});
  const avails = toAvails(J.getElementById("copiespanel-wrapper"))
  const now = Date.now();
  return {
    status,
    avails,
    buechereien: Object.keys(avails).sort((a, b) => a === "Zentralbibliothek im PFL" ? -1 : a.localeCompare(b)),
    updated: now,
    added: now,
    id,
    isbn: detail["ISBN13"],
    name: detail["Titel"],
    author: detail["Verfasserangabe"],
    release: detail["_release"]
  };
}

function toAvails(elem) {
  return Array.from(elem.querySelectorAll("tr"))
    .slice(1)
    .map(el => Array.from(el.querySelectorAll("td")).map(el => el.textContent.trim()))
    .reduce((acc, v, i, a) => {
      const [nr, buecherei, standort, _, zugang, status] = v
      if (!(buecherei in acc)) acc[buecherei] = [];
      const statusLoc = toStatus(status.toLowerCase());
      let frist = null
      if (statusLoc === "Entliehen") {
        frist = status.match(/bis (\d\d.\d\d.\d{4})/).slice(-1)[0]
      }
      acc[buecherei].push({bereich: null, standort, status: statusLoc, frist, vorbestellungen: 0});
      return acc;
    }, {});
}

function toStatus(c) {
  let status = "Entliehen";
  if (c.includes("verf")) {
    status = "Verfügbar";
  } else if (c.includes("transport")) {
    status = "Transport";
  } else if (c.includes("vorbestellt")) {
    status = "Vorbestellt";
  }
  return status;
}

function update(ref, b) {
  const upd = ["status", "avails", "buechereien", "updated", "id", "isbn", "name", "author", "release"]
  for (const u of upd) {
    ref[u] = b[u];
  }
}

function idOrLink(s) {
  if (!s.includes("/")) {
    return s;
  }
  const u = url.parse(s, true);
  return s.includes("data")
    ? atob(u.query.data)
        .split("&amp;")
        .find(x => x.startsWith("CatalogueId="))
        .split("=")[1]
    : u.query.Id;
}

module.exports.parse = parse;
module.exports.update = update;
module.exports.opening = "https://www.stadtbibliothek.oldenburg.de/bibliotheken/";
module.exports.detail = "/webopac/detail.aspx?Id="
module.exports.idOrLink = idOrLink;

