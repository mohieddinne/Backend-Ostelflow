const https = require("https");
const http = require("http");
module.exports.request = function (url) {
  return new Promise((resolve, reject) => {
    if (!url) reject(new Error("No url specified"));
    let handler = http;
    if (url.indexOf("https") === 0) handler = https;
    handler
      .get(url, (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            let json = JSON.parse(body);
            if (json) resolve(json);
          } catch (error) {
            console.log({ error });
            reject(error);
          }
        });
      })
      .on("error", (error) => {
        console.log({ error });
        reject(error);
      });
  });
};
