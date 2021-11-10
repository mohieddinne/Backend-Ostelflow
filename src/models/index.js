"use strict";

logger.info("[DB] Initialisation of the db configuration");

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const { sqLogger } = require("../config/logger");

const dbConfig = config.db;

const basename = path.basename(__filename);
const db = {};
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    ...dbConfig,
    hooks: {
      beforeDefine: function (columns, model) {
        model.tableName = "tbl_" + model.tableName;
      },
    },
    define: {
      timestamps: true,
      underscored: true,
    },
    // logging: (...msg) => {
    //   sqLogger.info(msg[0]);
    // },
  }
);

// Initiating models names if diffrent from schma's
db.gqlNames = { a: [], b: [] };
function prepareModel(pathToFile) {
  let modelFile = require(pathToFile);
  if (modelFile && typeof modelFile.default === "function")
    modelFile = modelFile;
  const model = modelFile(sequelize, Sequelize);
  db[model.name] = model;
  // Injecting models names if diffrent from schma's
  if (model.gqlName && model.gqlName !== model.name) {
    db.gqlNames.a.push(model.gqlName);
    db.gqlNames.b.push(model.name);
  }
  if (Array.isArray(model.gqlNames)) {
    model.gqlNames.map((gqlName) => {
      db.gqlNames.a.push(gqlName);
      db.gqlNames.b.push(model.name);
    });
  }
}
const appPath = path.join(process.cwd(), "src", "main", "app");
const isJsFile = (file) =>
  file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js";
const isDirectory = (dirPath) => fs.lstatSync(dirPath).isDirectory();

// Get Models from src/main/app
fs.readdirSync(appPath).map((dir) => {
  if (isDirectory(path.join(appPath, dir)))
    fs.readdirSync(path.join(appPath, dir)).map((modelsDir) => {
      if (
        isDirectory(path.join(appPath, dir, modelsDir)) &&
        modelsDir === "dbModels"
      )
        fs.readdirSync(path.join(appPath, dir, modelsDir)).map((file) => {
          const pathToFile = `../main/app/${dir}/${modelsDir}/${file}`;
          prepareModel(pathToFile);
        });
    });
});

// Get Models from current folder
fs.readdirSync(__dirname)
  .filter((file) => isJsFile(file))
  .forEach((file) => prepareModel("./" + file));

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
  if (db[modelName].defaultData) {
    db[modelName].defaultData(db[modelName]);
  }
});

db.sequelize = sequelize;

db.start = async function () {
  logger.info("Database connexion");
  logger.info("DB Name: " + sequelize.config.database);
  logger.info("DB Host: " + sequelize.config.host);
  logger.info("DB Authenticate into DB...");
  await sequelize.authenticate().then(async (r) => {
    logger.info("[DB] DB connexion: OK\n");
    //await sequelize.sync({ force: true });
  });
};

module.exports = db;
