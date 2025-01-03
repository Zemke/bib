const http = require('http');
const url = require('url');

async function read(res) {
  return new Promise((resolve, reject) => {
    let buff = "";
    res.on('data', d => buff += d);
    res.on('end', () => resolve(buff));
    res.on('error', () => reject(error));
  });
}

async function post(u, body) {
  const U = url.parse(u, true);
  return new Promise((resolve, reject) => {
    const req = http.request({
      method: "POST",
      host: U.host,
      path: U.path,
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      }
    }, async res => {
      read(res).then(resolve).catch(reject);
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/*
post("http://echo.free.beeceptor.com/sample-request", "[1,2]")
  .then(res => console.log(res))
  .catch(err => console.error(err));
*/

function formData(fd) {
  return fd.split("=").reduce((acc, v, i, a) => {
    if (i % 2 === 0) {
      acc[v] = null;
    } else {
      acc[a[i-1]] = decodeURIComponent(v);
    }
    return acc;
  }, {});
}

module.exports.post = post;
module.exports.read = read;
module.exports.formData = formData;

