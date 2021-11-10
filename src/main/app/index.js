const path = require("path");
const fs = require("fs");
const basename = path.basename(__filename);
const resolvers = [];
const schema = [];
fs.readdirSync(__dirname).map((modelName) => {
  if (modelName.slice(-3) !== ".js") {
    fs.readdirSync(path.join(__dirname, modelName))
      .filter((file) => {
        return (
          file.indexOf(".") !== 0 &&
          file !== basename &&
          file.slice(-3) === ".js"
        );
      })
      .map((file) => {
        if (file == "resolvers.js")
          resolvers.push(require(`./${modelName}/${file}`));
        if (file == "schema.js") schema.push(require(`./${modelName}/${file}`));
      });
  }
});
module.exports.resolvers = resolvers;
module.exports.schema = schema;
