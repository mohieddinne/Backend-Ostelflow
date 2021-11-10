"use strict";

const winston = require("winston");
require("winston-daily-rotate-file");

const { combine, timestamp, printf } = winston.format;

const loggerFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] ${message}`;
});

const transport = new winston.transports.DailyRotateFile({
  filename: "logs/insertprojectnamehere-backend-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

transport.on("archive", async function (zipFilename) {
  if (emailService) {
    const { fileExists } = require("../helpers/utils.helper");
    try {
      const timestamp = zipFilename
        .replace("logs/insertprojectnamehere-backend-", "")
        .replace(".log.gz", "");
      const path = await fileExists(zipFilename, "", true);
      const options = {
        to: "it-support@tekru.net",
        subject: timestamp + " - insertprojectnamehere backend daily logs",
        template: "admin-send-log",
        context: {
          timestamp,
        },
        attachments: [
          {
            filename: zipFilename.replace("logs/", ""),
            path,
          },
        ],
      };

      await emailService.transporter.sendMail(options);
    } catch (error) {
      console.log({ error });
    }
  }
});

winston.loggers.add("logger", {
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), loggerFormat),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    transport,
    new winston.transports.Console(),
  ],
});

winston.loggers.add("sqLogger", {
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), loggerFormat),
  transports: [new winston.transports.File({ filename: "logs/sql.log" })],
});

global.logger = winston.loggers.get("logger");
const sqLogger = winston.loggers.get("sqLogger");

module.exports.sqLogger = sqLogger;
