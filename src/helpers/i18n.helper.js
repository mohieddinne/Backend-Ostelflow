const i18n = require("i18n");
const path = require("path");

// TODO detect the local language depending of the user header
i18n.configure({
  locales: ["fr_CA"],
  defaultLocale: "fr_CA",
  directory: path.join(__dirname, "../../assets/i18n"),
});

module.exports = i18n;
