module.exports = async function () {
  global.emailService = null;
  logger.info("Starting email serviceses...");
  logger.info("Email host: " + config.email.host + ":" + config.email.port);
  // Import helpers
  const mailHelper = require("../helpers/email.helper");
  const utils = require("../helpers/utils.helper");
  // Create the transporter
  const transporter = await mailHelper.createTransport();

  const verify = await transporter.verify();
  if (!verify) {
    throw new Error("Email transporter");
  }
  const ops = [
    mailHelper.getNoReplyEmailAsync(),
    utils.getOption("email_subject_prefix"),
  ];
  const [defaultAddress, subjectPrefix] = await Promise.all(ops);

  global.emailService = {
    transporter,
    defaultAddress,
    subjectPrefix,
  };
  logger.info("Mail service: OK.\n");
};
