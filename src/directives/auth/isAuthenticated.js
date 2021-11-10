const {
  SchemaDirectiveVisitor,
  ApolloError,
} = require("apollo-server-express");
const { DirectiveLocation, GraphQLDirective } = require("graphql");
const hlprs = require("./helpers");
class IsAuthenticatedDirective extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration() {
    return new GraphQLDirective({
      name: "isAuthenticated",
      locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT],
    });
  }

  visitObject(obj) {
    const fields = obj.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const next = field.resolve;

      field.resolve = async function (result, args, context, info) {
        const decoded = await hlprs.verifyAndDecodeToken({ context }); // will throw error if not valid signed jwt
                return next(result, args, { ...context, user: decoded }, info);
      };
    });
  }

  visitFieldDefinition(field) {
    const next = field.resolve;

    field.resolve = async function (result, args, context, info) {
      const decoded = await hlprs.verifyAndDecodeToken({ context }); // will throw error if not valid signed jwt
      return next(result, args, { ...context, user: decoded }, info);
    };
  }
}

module.exports = IsAuthenticatedDirective;
