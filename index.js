const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const request = require('./request');

http.createServer(async (req, res) => {
  if (req.method === "POST") {
    const body = request.formData(await request.read(req));
    console.log(body);
    if (body["idOrLink"].includes("/")) {
      // TODO is link
    } else {
      const id = parseInt(body["idOrLink"]);
    }
    request.post(
      "https://open.stadt-muenster.de/DesktopModules/OCLC.OPEN.PL.DNN.SearchModule/SearchService.asmx/GetAvailability",
      `{'portalId':0,'mednr':'${id}','culture':'de-DE','branchFilter':'','requestCopyData':true}`
    )
      .then(res => console.log(res))
      .catch(err => console.error(err));
  }
  res.writeHeader(200, {"Content-Type": "text/html"});
  res.write(ejs.render(fs.readFileSync('./index.html', 'utf8'), {}));
  res.end();
}).listen(8000);


