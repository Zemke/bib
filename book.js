const fs = require('fs');
const jsdom = require("jsdom");

function parse(D) {
  const J = new jsdom.JSDOM(D).window.document;
  const table = J.querySelectorAll('table')[2];
  const xx = Array.from(table.querySelectorAll('td:nth-child(4)'))
    .map(el => el.textContent.split(":")[1].replaceAll(/[\t\n]/g, ""))
  let status = "Entliehen";
  if (xx.includes("Verfügbar")) {
    status = "Verfügbar";
  } else if (xx.includes("Transport")) {
    status = "Transport";
  }
  return {
    status,
    avails: toAvails(table.outerHTML.replaceAll(/[\t\n]/g, "")),
    id: J.getElementById("bibtip_number").textContent,
    isbn: J.getElementById("bibtip_isxn").textContent,
    name: J.getElementById("bibtip_hst").textContent,
    author: J.getElementById("bibtip_author").textContent,
    release: J.getElementById("bibtip_releasedate").textContent,
  };
}

function toAvails(table) {
  return Array.from(new jsdom.JSDOM(table).window.document.querySelectorAll("tr")).splice(1)
    .map(tr => Array.from(tr.querySelectorAll("td"))
      .map(el => el.textContent.split(":")[1]))
    .reduce((acc, v, i, a) => {
      const [buecherei, bereich, standort, status, frist, vorbestellungen] = v;
      if (!(buecherei in acc)) {
      acc[buecherei] = [];
      }
      acc[buecherei].push({bereich, standort, status, frist, vorbestellungen});
      return acc;
    }, {});
}

module.exports.parse = parse;

