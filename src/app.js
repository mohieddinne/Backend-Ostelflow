const express = require("express");
const { resolvers, typeDefs } = require("./main");
const schemaDirectives = require("./directives");

const { ApolloServer, PubSub } = require("apollo-server-express");

module.exports.createApp = () => {
  const app = express();
  const pubsub = new PubSub();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives,
    introspection: !config.frontend.serve,
    playground: !config.frontend.serve,
    uploads: {
      maxFileSize: 10000000, // 10 MB
      maxFiles: 20,
    },
    subscriptions: {
      onConnect: async (params) => {
        const jwt_lib = require("jsonwebtoken");
        try {
          if (!params.authorization) throw new Error("No authorization header");
          const parts = params.authorization.split(" ");
          if (parts.length < 2) throw new Error("No token detected");
          const token = parts[1];
          const user = jwt_lib.verify(token, config.jwt_secret, {
            credentialsRequired: false,
            algorithms: ["HS256"],
          });

          return {
            user,
            pubsub,
          };
        } catch (error) {
          console.log({ error });
          throw new Error("Bad token!");
        }
      },
      onDisconnect: (webSocket, connectionContext) => {},
    },
    context: (context) => {
      const user = context.req?.user || context.connection?.context.user;
      return { ...context, user, pubsub };
    },
  });

  // Apply Middleware to the graphQl server
  app.use(server.graphqlPath, require("./helpers/auth").jwt);
  server.applyMiddleware({ app, cors: true });

  // Set the powred by mark
  app.use(function (req, res, next) {
    res.setHeader("X-Powered-By", "Tekru Technologies - TN");
    next();
  });

  return {
    app,
    server,
  };
};
