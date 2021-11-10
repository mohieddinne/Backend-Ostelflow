const { gql } = require("apollo-server-express");

// Handel diffrent Apollo Schemas and Resolvers
const rootSchema = gql`
  directive @isAuthenticated on OBJECT | FIELD_DEFINITION
  directive @hasAccess(
    slug: String
    scope: String
    own: Boolean
  ) on OBJECT | FIELD_DEFINITION
  """
  Deprecated
  """
  enum Languages {
    fr_CA
  }

  input PagingOptions {
    PerPage: Int!
    Page: Int!
  }

  type Query {
    root: String
  }

  type Mutation {
    root: String
  }
  type Subscription {
    root: String
  }
`;

module.exports = rootSchema;
