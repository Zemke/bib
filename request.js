const https = require('https');
const url = require('url');

async function read(res) {
  return new Promise((resolve, reject) => {
    let buff = "";
    res.on('data', d => buff += d);
    res.on('end', () => resolve(buff));
    res.on('error', () => reject(error));
  });
}

async function post(u, body, headers={}) {
  const options = {
    method: "POST",
    ...url.parse(u, true),
    headers: {
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(body),
      ...headers,
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(
      options,
      res => read(res).then(resolve).catch(reject));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function get(u, headers={}) {
  const options = {
    method: "GET",
    ...url.parse(u, true),
    headers: {
      ...headers,
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(
      options,
      res => read(res).then(resolve).catch(reject));
    req.on('error', reject);
    req.end();
  });
}

//post("https://echo.free.beeceptor.com/sample-request", "[1,2]", {'content-type': 'text/plain'})
//  .then(res => console.log(res))
//  .catch(err => console.error(err));

function formData(fd) {
  return fd.split("&").reduce((acc, v, i, a) => {
    const sp = v.split("=");
    acc[sp[0]] = sp[1];
    return acc;
  }, {});
}

module.exports.post = post;
module.exports.get = get;
module.exports.read = read;
module.exports.formData = formData;

