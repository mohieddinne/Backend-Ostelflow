const { ApolloError } = require("apollo-server-express");
const i18nHelper = require("../../helpers/i18n.helper");
const accessHelpers = require("./helpers");
const userHelpers = require("../user/helpers");

const hA = userHelpers.hasAccess.bind(userHelpers);

const resolvers = {
  Query: {
    async roles(_, args, { user }) {
      // Make sure user is logged in
      if (!user || user.id === undefined) {
        throw new ApolloError(
          i18nHelper.__("NOT_AUTHENTICATED"),
          "NOT_AUTHENTICATED"
        );
      }

      // Check access
      const access = await hA("permissions", "can_view", user.id);
      if (!access)
        throw new ApolloError(i18nHelper.__("grant_error"), "grant_error");

      return await accessHelpers.getRoles(args.ids);
    },
    async getRoleId(_, args, { user }) {
      // Make sure user is logged in
      if (!user || user.id === undefined) {
        throw new ApolloError(
          i18nHelper.__("NOT_AUTHENTICATED"),
          "NOT_AUTHENTICATED"
        );
      }
      // Check access
      const access = await hA("permissions", "can_view", user.id);
      if (!access) {
        throw new ApolloError(i18nHelper.__("grant_error"), "grant_error");
      }
      const roleId = await accessHelpers.getRoleId(args.name);
      return roleId;
    },

    async accesses(_, args, { user }) {
      // Make sure user is logged in
      if (!user || user.id === undefined) {
        throw new ApolloError(
          i18nHelper.__("NOT_AUTHENTICATED"),
          "NOT_AUTHENTICATED"
        );
      }

      // Check access
      const access = await hA("permissions", "can_view", user.id);
      if (!access) {
        throw new ApolloError(i18nHelper.__("grant_error"), "grant_error");
      }

      return await accessHelpers.getAccesses(args.ids);
    },
  },

  Mutation: {
    async privilege(_, args, { user }) {
      // Make sure user is logged in
      if (!user || !user.id) {
        const e = "NOT_AUTHENTICATED";
        throw new ApolloError(i18nHelper.__(e), e);
      }

      // Check access
      const hasAccess = await hA("permissions", "can_edit", user.id);
      if (!hasAccess)
        throw new ApolloError(i18nHelper.__("grant_error"), "grant_error");

      // Execute the operation
      const { role, slug, privilege } = args;
      try {
        await accessHelpers.toggleAccess(role, slug, privilege);
      } catch (error) {
        console.log(error);
        logger.error(error);
        Sentry.captureException(error);
        const message = "Error updating user privilege";
        throw new ApolloError(message, "SERVER_ERROR");
      }
      return true;
    },
    async role(_, args, { user }) {
      // Make sure user is logged in
      if (!user || !user.id) {
        const e = "NOT_AUTHENTICATED";
        throw new ApolloError(i18nHelper.__(e), e);
      }

      // Check access
      const hasAccess = await hA("permissions", "can_create", user.id);
      if (!hasAccess)
        throw new ApolloError(i18nHelper.__("grant_error"), "grant_error");

      // Execute the operation
      const { item } = args;
      let role = null;
      try {
        role = await accessHelpers.createRole(item);
      } catch (error) {
        console.log(error);
        logger.error(error);
        Sentry.captureException(error);
        const message = "Error updating user privilege";
        throw new ApolloError(message, "SERVER_ERROR");
      }

      // Check access
      const access = await hA("permissions", "can_view", user.id);
      if (!access) return role.id;

      return role;
    },
  },
};

module.exports = resolvers;
