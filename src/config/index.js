const config =JSON.parse(require("./default.js"));
require("./sentry.io");
require("./logger");

logger.info("Loading the server config...");
logger.info("Getting the NODE_ENV...");

let env = config.default_dev_env;
if (process.env.NODE_ENV) {
  env = process.env.NODE_ENV;
  logger.info("NODE_ENV found, value: " + process.env.NODE_ENV);
} else {
  logger.info("NODE_ENV not found, setting default value: " + env);
}

logger.info("Loading the server config for ENV: " + env);
if (config[env]) {
  logger.info("Config [ " + env + " ] loaded.\n");
} else {
  const error = "No config for [ " + env + " ] available.";
  logger.error(error);
  Sentry.captureException(new Error(error));
  Sentry.close(2000).then(function () {
    logger.info("About to exit with code: 1");
    process.exit(1);
  });
}
// Adding the main values
config[env].env = env;
config[env].default_port = config.default_port;

global.config = config[env];
