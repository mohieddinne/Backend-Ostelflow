const jwt = require("express-jwt");
module.exports.jwt = jwt({
  secret: config.jwt_secret,
  credentialsRequired: false,
  algorithms: ["HS256"],
});
