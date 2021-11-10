// const EmailTemplates = require("./email-template-content/");
const DynamicMenu = require("./dynamic-menu/");
const ActivityLog = require("./activity-logs/");

module.exports = {
  schemas: [
    //EmailTemplates.schema,
    // DynamicMenu.schema,
    ActivityLog.schema,
  ],
  resolvers: [
    //EmailTemplates.resolvers,
    // DynamicMenu.resolvers,
    ActivityLog.resolvers,
  ],
};
