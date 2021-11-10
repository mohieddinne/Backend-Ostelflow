const App = require("./app");
const Core = require("./core");

// Resplvers
const userResolvers = require("./user/resolvers");
const accessResolvers = require("./access/resolvers");

// Schema
const userSchema = require("./user/schema");
const accessSchema = require("./access/schema");
const rootSchema = require("./root");

module.exports.resolvers = [
  userResolvers,
  accessResolvers,
  ...App.resolvers,
  ...Core.resolvers,
];
module.exports.typeDefs = [
  rootSchema,
  userSchema,
  accessSchema,
  ...App.schema,
  ...Core.schemas,
];
