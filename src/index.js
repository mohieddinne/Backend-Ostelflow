const http = require("http");

require("./config");
const emailService = require("./config/emailService");
logger.info("Welcome to Catu Backend Server\n");

(async () => {
  // Start the DB
  const db = require("./models");
  await db.start();
  await db.sequelize.sync();
  // await db.sequelize.sync({ force: true }).then(() => {
  //   console.log("Drop and re-sync db.");
  // });
  const { app, server } = require("./app").createApp();
  // Email server
  try {
    await emailService();
  } catch (error) {
    //console.log(error);
    Sentry.captureException(error);
    logger.error("Email servise is not starting.");
    logger.error(error);
  }
  const port = process.env.PORT || config.port || 4000;
  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);

  httpServer.listen(port, async () => {
    const { graphqlPath, subscriptionsPath } = server;
    logger.info(`Server ready at */:${port}${graphqlPath}`);
    logger.info(`Subscriptions ready at ws://*/:${port}${subscriptionsPath}`);
    logger.info(`Server ready at */:${port}/data\n`);
  });
})().catch((error) => {
  Sentry.captureException(error);
  logger.error("Error ! Unhandled exception.");
  logger.error(error);
  console.error(error);
  logger.warn("About to exit with code: 1");
  Sentry.close(2000).then(function () {
    process.exit(1);
  });
});
