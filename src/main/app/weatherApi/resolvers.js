const helpers = require("./helpers");

const resolvers = {
  Query: {
    async getWeather(_, args, ctx, info) {
      return helpers.getWeather();
    },
  },
};

module.exports = resolvers;
