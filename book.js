const fs = require('fs');
const jsdom = require("jsdom");

function parse(D) {
  //const D = fs.readFileSync('./detail.html', 'utf8');
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
  const res = {
    status,
    table: table.outerHTML.replaceAll(/[\t\n]/g, ""),
    id: J.getElementById("bibtip_number").textContent,
    isbn: J.getElementById("bibtip_isxn").textContent,
    name: J.getElementById("bibtip_hst").textContent,
    author: J.getElementById("bibtip_author").textContent,
    release: J.getElementById("bibtip_releasedate").textContent,
  };
  return res;
}

module.exports.parse = parse;

